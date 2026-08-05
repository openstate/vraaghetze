import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as moderation from './moderation';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
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

async function createQuestion(overrides: Partial<typeof schema.question.$inferInsert> = {}) {
	const asker = await createUser('Vera Vraagsteller');
	const politician = await createUser('Jan Jansen');

	const fractionId = crypto.randomUUID();
	await db
		.insert(schema.fraction)
		.values({ id: fractionId, slug: `tf-${fractionId}`, name: 'Testfractie', abbreviation: 'TF' });

	const politicianId = crypto.randomUUID();
	await db.insert(schema.politician).values({
		id: politicianId,
		slug: `jan-jansen-${politicianId}`,
		userId: politician.id,
		fractionId,
		fractionRole: 'member'
	});

	const id = crypto.randomUUID();

	const [question] = await db
		.insert(schema.question)
		.values({
			id,
			userId: asker.id,
			assigneeId: politician.id,
			title: 'Wat vindt u van de toeslagen?',
			body: 'Graag een toelichting.',
			slug: `testvraag-${id}`,
			verifiedAt: new Date(),
			...overrides
		})
		.returning();

	return { question, asker, politician };
}

async function getQuestion(questionId: string) {
	const [question] = await db
		.select()
		.from(schema.question)
		.where(eq(schema.question.id, questionId));
	return question;
}

async function getEnqueuedMails(questionId: string) {
	return db.select().from(schema.outbox).where(eq(schema.outbox.questionId, questionId));
}

beforeEach(async () => {
	await db.transaction(async (tx) => {
		await tx.delete(schema.moderationAction);
		await tx.delete(schema.inbox);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
	});
});

afterEach(() => {
	testEnv.DIVERSION_EMAIL = '';
});

describe('listQueue', () => {
	test('lists only verified pending questions, oldest first', async () => {
		const older = await createQuestion({ createdAt: new Date('2026-07-01') });
		const newer = await createQuestion({ createdAt: new Date('2026-07-10') });
		await createQuestion({ verifiedAt: null });
		await createQuestion({ status: 'approved' });
		await createQuestion({ status: 'rejected' });

		const queue = await moderation.listQueue();

		expect(queue.map((row) => row.id)).toEqual([older.question.id, newer.question.id]);
	});
});

describe('moderate', () => {
	test('approves a question, mints a reply token and mails both parties', async () => {
		const { question, asker, politician } = await createQuestion();
		const moderator = await createUser('Mo Moderator');

		const result = await moderation.moderate({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'approved',
			note: 'prima vraag'
		});

		expect(result).toEqual({ action: 'approved' });
		const stored = await getQuestion(question.id);
		expect(stored.status).toBe('approved');
		expect(stored.emailToken).not.toBeNull();

		const [auditRow] = await db
			.select()
			.from(schema.moderationAction)
			.where(eq(schema.moderationAction.questionId, question.id));
		expect(auditRow).toMatchObject({
			moderatorId: moderator.id,
			action: 'approved',
			note: 'prima vraag'
		});

		const mails = await getEnqueuedMails(question.id);
		expect(mails).toHaveLength(2);
		const politicianMail = mails.find((mail) => mail.kind === 'question-notification');
		expect(politicianMail).toMatchObject({
			recipient: politician.email,
			replyTo: `antwoord+${stored.emailToken}@test.example`
		});
		expect(politicianMail?.body).toContain(question.title);
		const askerMail = mails.find((mail) => mail.kind === 'moderation-notification');
		expect(askerMail).toMatchObject({ recipient: asker.email });
		expect(askerMail?.body).toContain(`${testEnv.ORIGIN}/vragen/${question.slug}`);
	});

	test('diverts the politician mail when DIVERSION_EMAIL is set', async () => {
		testEnv.DIVERSION_EMAIL = 'divert@test.example';
		const { question } = await createQuestion();
		const moderator = await createUser('Mo Moderator');

		await moderation.moderate({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'approved'
		});

		const mails = await getEnqueuedMails(question.id);
		const politicianMail = mails.find((mail) => mail.kind === 'question-notification');
		expect(politicianMail?.recipient).toBe(testEnv.DIVERSION_EMAIL);
	});

	test('rejects a question without a reply token and mails only the asker', async () => {
		const { question, asker } = await createQuestion();
		const moderator = await createUser('Mo Moderator');

		const result = await moderation.moderate({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'rejected'
		});

		expect(result).toEqual({ action: 'rejected' });
		const stored = await getQuestion(question.id);
		expect(stored.status).toBe('rejected');
		expect(stored.emailToken).toBeNull();

		const mails = await getEnqueuedMails(question.id);
		expect(mails).toHaveLength(1);
		expect(mails[0]).toMatchObject({ kind: 'moderation-notification', recipient: asker.email });
	});

	test('treats a second moderation of the same question as already handled', async () => {
		const { question } = await createQuestion();
		const moderator = await createUser('Mo Moderator');

		const first = await moderation.moderate({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'approved'
		});
		const second = await moderation.moderate({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'rejected'
		});

		expect(first).toEqual({ action: 'approved' });
		expect(second).toEqual({ error: 'already-handled' });
		expect((await getQuestion(question.id)).status).toBe('approved');
		const auditRows = await db
			.select()
			.from(schema.moderationAction)
			.where(eq(schema.moderationAction.questionId, question.id));
		expect(auditRows).toHaveLength(1);
		expect(await getEnqueuedMails(question.id)).toHaveLength(2);
	});

	test('refuses to moderate an unverified question', async () => {
		const { question } = await createQuestion({ verifiedAt: null });
		const moderator = await createUser('Mo Moderator');

		const result = await moderation.moderate({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'approved'
		});

		expect(result).toEqual({ error: 'not-verified' });
		expect((await getQuestion(question.id)).status).toBe('pending');
		expect(await getEnqueuedMails(question.id)).toHaveLength(0);
	});
});
