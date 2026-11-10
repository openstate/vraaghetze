import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';
import {
	createAnswerAndQuestion,
	createUser,
	getAnswer,
	getQuestion,
	makeActionEvent,
	statusOf
} from '$lib/test-utils';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

type LoadData = Exclude<Awaited<ReturnType<typeof page.load>>, void>;

function makeLoadEvent(user: typeof schema.user.$inferSelect | null) {
	return { locals: { user: user ?? undefined } } as unknown as Parameters<typeof page.load>[0];
}

function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	return makeActionEvent<typeof page.actions.default>(
		`http://localhost/modereren/antwoorden`,
		user,
		fields
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
		const { answer } = await createAnswerAndQuestion();

		const result = (await page.load(makeLoadEvent(moderator))) as LoadData;

		expect(result.queue).toMatchObject([{ answer: { id: answer.id } }]);
	});
});

describe('default action', () => {
	test('fails without a signed-in user', async () => {
		const { answer, question } = await createAnswerAndQuestion();
		const event = myMakeActionEvent(null, { answerId: answer.id, action: 'approved' });

		expect(await statusOf(page.actions.default(event))).toBe(400);
		expect(await getAnswer(answer.id)).toMatchObject({ status: 'pending' });
		expect(await getQuestion(question.id)).toMatchObject({ status: 'approved' });
	});

	test('moderates an answer for a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { answer, question } = await createAnswerAndQuestion();
		const event = myMakeActionEvent(moderator, { answerId: answer.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: answer.id });
		expect(await getAnswer(answer.id)).toMatchObject({ status: 'approved' });
		expect(await getQuestion(question.id)).toMatchObject({ status: 'answered' });
	});

	test('fails on an invalid form', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const event = myMakeActionEvent(moderator, { action: 'iets-anders' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
	});

	test('reports an already handled answer', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { answer, question } = await createAnswerAndQuestion({ status: 'rejected' });
		const event = myMakeActionEvent(moderator, { answerId: answer.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 409 });
		expect((await getAnswer(answer.id)).status).toBe('rejected');
		expect(await getQuestion(question.id)).toMatchObject({ status: 'approved' });
	});
});

describe('redacting', () => {
	test('redacts when replacement is normal text', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const text = "Please replace part of me";
		const expectedText = "Please replace <verwijderd> of me";
		const { answer, question } = await createAnswerAndQuestion({ body: text });
		const event = myMakeActionEvent(moderator, {
			answerId: answer.id,
			action: 'redact',
			searchTexts: JSON.stringify(['part']),
			replaceTexts: JSON.stringify(['<verwijderd>'])
		});

		const result = await page.actions.default(event);

		expect(result).toEqual({ answerId: answer.id, redacted: true });
		const redactedAnswer = await getAnswer(answer.id);
		expect(redactedAnswer.status).toEqual('pending');
		expect(redactedAnswer.body).toEqual(expectedText)
		expect(await getQuestion(question.id)).toMatchObject({ status: 'approved'});
	});

	test('redacts when replacement contains regexp characters', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const text = "Please replace this telephone number (+31)  06 38040052 for me";
		const expectedText = "Please replace this telephone number <verwijderd> for me";
		const { answer, question } = await createAnswerAndQuestion({ body: text });
		const event = myMakeActionEvent(moderator, {
			answerId: answer.id,
			action: 'redact',
			searchTexts: JSON.stringify(['(+31)  06 38040052']),
			replaceTexts: JSON.stringify(['<verwijderd>'])
		});

		const result = await page.actions.default(event);

		expect(result).toEqual({ answerId: answer.id, redacted: true });
		const redactedAnswer = await getAnswer(answer.id);
		expect(redactedAnswer.status).toEqual('pending');
		expect(redactedAnswer.body).toEqual(expectedText)
		expect(await getQuestion(question.id)).toMatchObject({ status: 'approved'});
	});
});
