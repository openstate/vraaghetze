import { beforeEach, describe, expect, test, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';
import { createQuestion, createUser, getQuestion } from '$lib/test-utils';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

async function getModerationAction(questionId: string) {
	const [moderationAction] = await db
		.select()
		.from(schema.moderationAction)
		.where(eq(schema.moderationAction.questionId, questionId));
	return moderationAction;
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
		const { question } = await createQuestion();

		const result = (await page.load(makeLoadEvent(moderator))) as LoadData;

		expect(result.queue).toMatchObject([{ id: question.id }]);
	});
});

describe('default action', () => {
	test('fails without a signed-in user', async () => {
		const { question } = await createQuestion();
		const event = makeActionEvent(null, { questionId: question.id, action: 'approved' });

		expect(await statusOf(page.actions.default(event))).toBe(400);
		expect(await getQuestion(question.id)).toMatchObject({ status: 'pending' });
	});

	test('moderates a question for a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
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

	test('requires rejection reasons when rejecting', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'rejected', rejectionReason: '' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
	});

	test('stores rejection reasons when rejecting', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'rejected', rejectionReason: 'offensive' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ moderated: question.id });
		expect((await getModerationAction(question.id)).rejectionReason).toBe('offensive');
	});

	test('validates rejection reasons when rejecting', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'rejected', rejectionReason: 'i_do_not_exist' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
	});

	test('ignores rejection reasons when approving', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'approved', rejectionReason: 'offensive' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ moderated: question.id });
		expect((await getModerationAction(question.id)).rejectionReason).toBe('');
	});

	test('reports an already handled question', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion({ status: 'approved' });
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'rejected', rejectionReason: 'offensive' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 409 });
		expect((await getQuestion(question.id)).status).toBe('approved');
	});

	test('reports an unverified question', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion({ verifiedAt: null });
		const event = makeActionEvent(moderator, { questionId: question.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 409 });
		expect((await getQuestion(question.id)).status).toBe('pending');
	});
});
