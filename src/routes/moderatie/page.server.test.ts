import { beforeEach, describe, expect, test, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

async function createUser(name: string, overrides: Partial<typeof schema.user.$inferInsert> = {}) {
	const id = crypto.randomUUID();

	const [created] = await db
		.insert(schema.user)
		.values({ id, name, email: `${id}@test.example`, emailVerified: true, ...overrides })
		.returning();

	return created;
}

async function createQuestion(overrides: Partial<typeof schema.question.$inferInsert> = {}) {
	const asker = await createUser('Vera Vraagsteller');
	const politician = await createUser('Jan Jansen');
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

	return question;
}

async function getQuestion(questionId: string) {
	const [question] = await db
		.select()
		.from(schema.question)
		.where(eq(schema.question.id, questionId));
	return question;
}

type LoadData = Exclude<Awaited<ReturnType<typeof page.load>>, void>;

// the HTTP status a handler outcome would produce, whether it returned data (200),
// returned a fail(), or threw a redirect or error
async function statusOf(handlerResult: unknown) {
	const outcome = await Promise.resolve(handlerResult).catch((thrown) => thrown);
	return (outcome as { status?: number } | null)?.status ?? 200;
}

// blocked means a redirect to the login page or a client error, never a crash
function expectBlocked(status: number) {
	expect(status).toBeGreaterThanOrEqual(300);
	expect(status).toBeLessThan(500);
}

function makeLoadEvent(user: typeof schema.user.$inferSelect | null) {
	return { locals: { user: user ?? undefined } } as unknown as Parameters<typeof page.load>[0];
}

function makeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);

	return {
		locals: { user: user ?? undefined },
		request: new Request('http://localhost/moderatie', { method: 'POST', body: formData })
	} as unknown as Parameters<typeof page.actions.default>[0];
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

describe('load', () => {
	test('blocks an anonymous visitor', async () => {
		expectBlocked(await statusOf(page.load(makeLoadEvent(null))));
	});

	test('blocks a user without moderator permission', async () => {
		const user = await createUser('Gewone Gebruiker');

		expectBlocked(await statusOf(page.load(makeLoadEvent(user))));
	});

	test('returns the queue to a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const question = await createQuestion();

		const result = (await page.load(makeLoadEvent(moderator))) as LoadData;

		expect(result.queue).toMatchObject([{ id: question.id }]);
	});
});

describe('default action', () => {
	test('blocks an anonymous visitor', async () => {
		const question = await createQuestion();
		const event = makeActionEvent(null, { questionId: question.id, action: 'approved' });

		expectBlocked(await statusOf(page.actions.default(event)));
		expect(await getQuestion(question.id)).toMatchObject({ status: 'pending' });
	});

	test('blocks a user without moderator permission', async () => {
		const user = await createUser('Gewone Gebruiker');
		const question = await createQuestion();
		const event = makeActionEvent(user, { questionId: question.id, action: 'approved' });

		expectBlocked(await statusOf(page.actions.default(event)));
		expect(await getQuestion(question.id)).toMatchObject({ status: 'pending' });
	});

	test('moderates a question for a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const question = await createQuestion();
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: question.id });
		expect(await getQuestion(question.id)).toMatchObject({ status: 'approved' });
	});

	test('fails on an invalid form', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const event = makeActionEvent(moderator, { action: 'iets-anders' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
	});

	test('reports an already handled question as a conflict', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const question = await createQuestion({ status: 'approved' });
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'rejected' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 409,
			data: { error: 'Deze vraag is al behandeld.' }
		});
		expect((await getQuestion(question.id)).status).toBe('approved');
	});

	test('reports an unverified question as awaiting confirmation, not as handled', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const question = await createQuestion({ verifiedAt: null });
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 409,
			data: { error: 'Deze vraag is nog niet bevestigd door de vraagsteller.' }
		});
		expect((await getQuestion(question.id)).status).toBe('pending');
	});
});
