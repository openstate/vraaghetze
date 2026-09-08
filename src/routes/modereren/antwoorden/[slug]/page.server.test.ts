import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';
import { createAnswerAndQuestion, createUser, getAnswer, makeActionEvent, statusOf } from '$lib/test-utils';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

type LoadData = Exclude<Awaited<ReturnType<typeof page.load>>, void>;

function makeLoadEvent(
  slug: string,
  user: typeof schema.user.$inferSelect | null
) {
	return {
		params: { slug },
    locals: { user: user ?? undefined }
  } as unknown as Parameters<typeof page.load>[0];
}

function myMakeActionEvent(
  slug: string,
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	return makeActionEvent<typeof page.actions.default>(
		`http://localhost/modereren/antwoorden/${slug}`,
		user,
		fields,
    slug
	);
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
		const answer = await createAnswerAndQuestion();

		const result = (await page.load(makeLoadEvent(answer.id, moderator))) as LoadData;
    // The answer inside the load function does not have all the properties
    let expectedAnswer = (({ questionId, searchVector, status, updatedAt, userId, ...object }) => object)(answer);
		expect(result.answer).toMatchObject(expectedAnswer);
	});
});

describe('default action', () => {
	test('fails without a signed-in user', async () => {
		const answer = await createAnswerAndQuestion();
		const event = myMakeActionEvent(answer.id, null, { answerId: answer.id, action: 'approved' });

		expect(await statusOf(page.actions.default(event))).toBe(400);
		expect(await getAnswer(answer.id)).toMatchObject({ status: 'pending' });
	});

	test('moderates an answer for a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const answer = await createAnswerAndQuestion();
		const event = myMakeActionEvent(answer.id, moderator, { answerId: answer.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: answer.id });
		expect(await getAnswer(answer.id)).toMatchObject({ status: 'approved' });
	});

	test('fails on an invalid form', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const event = myMakeActionEvent('1234', moderator, { action: 'iets-anders' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
	});

	test('reports an already handled answer', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const answer = await createAnswerAndQuestion({ status: 'rejected' });
		const event = myMakeActionEvent(answer.id, moderator, { answerId: answer.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 409 });
		expect((await getAnswer(answer.id)).status).toBe('rejected');
	});
});
