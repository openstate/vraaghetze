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

async function createAnswer(overrides: Partial<typeof schema.answer.$inferInsert> = {}) {
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

	const questionId = crypto.randomUUID();
	await db.insert(schema.question).values({
		id: questionId,
		userId: asker.id,
		assigneeId: politician.id,
		title: 'Wat vindt u van de toeslagen?',
		body: 'Graag een toelichting.',
		slug: `testvraag-${questionId}`,
		status: 'approved',
		verifiedAt: new Date()
	});

	const [answer] = await db
		.insert(schema.answer)
		.values({
			id: crypto.randomUUID(),
			questionId,
			userId: politician.id,
			body: 'Mijn antwoord op uw vraag.',
			...overrides
		})
		.returning();

	return answer;
}

async function getAnswer(answerId: string) {
	const [answer] = await db.select().from(schema.answer).where(eq(schema.answer.id, answerId));
	return answer;
}

type LoadData = Exclude<Awaited<ReturnType<typeof page.load>>, void>;

async function statusOf(handlerResult: unknown) {
	const outcome = await Promise.resolve(handlerResult).catch((thrown) => thrown);
	return (outcome as { status?: number } | null)?.status ?? 200;
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
		request: new Request('http://localhost/modereren', { method: 'POST', body: formData })
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

// authorization for the whole /modereren section lives in handleAuthorization, not in
// these loads and actions; see src/hooks.server.test.ts
describe('load', () => {
	test('returns the queue to a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const answer = await createAnswer();

		const result = (await page.load(makeLoadEvent(moderator))) as LoadData;

		expect(result.queue).toMatchObject([{ id: answer.id }]);
	});
});

describe('default action', () => {
	test('fails without a signed-in user', async () => {
		const answer = await createAnswer();
		const event = makeActionEvent(null, { answerId: answer.id, action: 'approved' });

		expect(await statusOf(page.actions.default(event))).toBe(400);
		expect(await getAnswer(answer.id)).toMatchObject({ status: 'pending' });
	});

	test('moderates an answer for a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const answer = await createAnswer();
		const event = makeActionEvent(moderator, { answerId: answer.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: answer.id });
		expect(await getAnswer(answer.id)).toMatchObject({ status: 'approved' });
	});

	test('fails on an invalid form', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const event = makeActionEvent(moderator, { action: 'iets-anders' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
	});

	test('reports an already handled answer', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const answer = await createAnswer({ status: 'rejected' });
		const event = makeActionEvent(moderator, { answerId: answer.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 409 });
		expect((await getAnswer(answer.id)).status).toBe('rejected');
	});
});
