import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import { receiveInboundEmail } from './inbox';
import type { InboundEmail } from './parse-inbound';
import { createQuestion } from '$lib/test-utils';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	EMAIL_INBOX: 'inbox@test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

async function createUser(name: string) {
	const id = crypto.randomUUID();

	const [created] = await db
		.insert(schema.user)
		.values({ id, name, email: `${id}@test.example`, emailVerified: true })
		.returning();

	return created;
}

async function myCreateQuestion(overrides: Partial<typeof schema.question.$inferInsert> = {}) {
	return createQuestion({
		verifiedAt: null,
		status: 'approved',
		emailToken: crypto.randomUUID(),
		...overrides
	}, false)
}

function makeEmail(
	sender: string,
	token: string | null,
	overrides: Partial<InboundEmail> = {}
): InboundEmail {
	const to = token ? `antwoord+${token}@test.example` : 'info@test.example';

	return {
		headers: `From: Jan Jansen <${sender}>`,
		dkim: '{@test.example : pass}',
		SPF: 'pass',
		to,
		from: `Jan Jansen <${sender}>`,
		subject: 'Re: Uw vraag',
		text: 'Mijn antwoord op uw vraag.',
		sender_ip: '127.0.0.1',
		envelope: { from: sender, to: [to] },
		charsets: {},
		...overrides
	};
}

async function getInboxRow(sender: string) {
	const [row] = await db.select().from(schema.inbox).where(eq(schema.inbox.fromAddress, sender));
	return row;
}

beforeEach(async () => {
	await db.transaction(async (tx) => {
		await tx.delete(schema.inbox);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
	});
});

afterEach(() => {
	testEnv.DIVERSION_EMAIL = '';
});

describe('receiveInboundEmail', () => {
	test('stores the answer for moderation without notifying anyone', async () => {
		const { question, politician } = await myCreateQuestion();

		await receiveInboundEmail(makeEmail(politician.email, question.emailToken));

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('processed');
		expect(stored.reason).toBeNull();
		expect(stored.processedAt).not.toBeNull();

		const [answer] = await db
			.select()
			.from(schema.answer)
			.where(eq(schema.answer.questionId, question.id));

		expect(answer).toMatchObject({
			userId: politician.id,
			body: 'Mijn antwoord op uw vraag.',
			status: 'pending'
		});
		expect(stored.answerId).toBe(answer.id);

		const mails = await db
			.select()
			.from(schema.outbox)
			.where(eq(schema.outbox.questionId, question.id));

		expect(mails).toHaveLength(0);
	});

	test('stores a second reply as long as nothing has been published', async () => {
		const { question, politician } = await myCreateQuestion();

		await receiveInboundEmail(makeEmail(politician.email, question.emailToken));
		await receiveInboundEmail(
			makeEmail(politician.email, question.emailToken, { text: 'Nu mijn echte antwoord.' })
		);

		const answers = await db
			.select()
			.from(schema.answer)
			.where(eq(schema.answer.questionId, question.id));

		expect(answers).toHaveLength(2);
		expect(answers.map((answer) => answer.status)).toEqual(['pending', 'pending']);
	});

	test('ignores a duplicate delivery of the same mail', async () => {
		const { question, politician } = await myCreateQuestion();
		const email = makeEmail(politician.email, question.emailToken);

		await receiveInboundEmail(email);
		await receiveInboundEmail(email);

		const inboxRows = await db
			.select()
			.from(schema.inbox)
			.where(eq(schema.inbox.fromAddress, politician.email));

		expect(inboxRows).toHaveLength(1);

		const answers = await db
			.select()
			.from(schema.answer)
			.where(eq(schema.answer.questionId, question.id));

		expect(answers).toHaveLength(1);
	});

	test('ignores mail without an answer token', async () => {
		const { politician } = await myCreateQuestion();

		await receiveInboundEmail(makeEmail(politician.email, null));

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores auto-replies', async () => {
		const { question, politician } = await myCreateQuestion();
		const email = makeEmail(politician.email, question.emailToken, {
			headers: 'Precedence: bulk'
		});

		await receiveInboundEmail(email);

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores bounces with an empty envelope sender', async () => {
		const { question, politician } = await myCreateQuestion();
		const email = makeEmail(politician.email, question.emailToken);
		email.envelope = { ...email.envelope, from: '' };

		await receiveInboundEmail(email);

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores mail from an unverified sender', async () => {
		const { question, politician } = await myCreateQuestion();
		const email = makeEmail(politician.email, question.emailToken, {
			dkim: '{@test.example : fail}'
		});

		await receiveInboundEmail(email);

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores mail with an unknown token', async () => {
		const sender = `${crypto.randomUUID()}@test.example`;

		await receiveInboundEmail(makeEmail(sender, crypto.randomUUID()));

		const stored = await getInboxRow(sender);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores replies to a question that is not approved', async () => {
		const { question, politician } = await myCreateQuestion({ status: 'pending' });

		await receiveInboundEmail(makeEmail(politician.email, question.emailToken));

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores replies to an already answered question', async () => {
		const { question, politician } = await myCreateQuestion();
		await db.insert(schema.answer).values({
			id: crypto.randomUUID(),
			questionId: question.id,
			userId: politician.id,
			body: 'Eerder antwoord.',
			status: 'approved'
		});

		await receiveInboundEmail(makeEmail(politician.email, question.emailToken));

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores mail from someone other than the assigned politician', async () => {
		const { question } = await myCreateQuestion();
		const stranger = await createUser('Sjaak Stranger');

		await receiveInboundEmail(makeEmail(stranger.email, question.emailToken));

		const stored = await getInboxRow(stranger.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('ignores mail with an empty reply text', async () => {
		const { question, politician } = await myCreateQuestion();
		const email = makeEmail(politician.email, question.emailToken, { text: '' });

		await receiveInboundEmail(email);

		const stored = await getInboxRow(politician.email);
		expect(stored.status).toBe('ignored');
		expect(stored.answerId).toBeNull();
	});

	test('accepts replies from the diversion address when DIVERSION_EMAIL is set', async () => {
		testEnv.DIVERSION_EMAIL = 'divert@test.example';
		const { question } = await myCreateQuestion();

		await receiveInboundEmail(makeEmail(testEnv.DIVERSION_EMAIL, question.emailToken));

		const stored = await getInboxRow(testEnv.DIVERSION_EMAIL);
		expect(stored.status).toBe('processed');
		expect(stored.answerId).not.toBeNull();
	});
});
