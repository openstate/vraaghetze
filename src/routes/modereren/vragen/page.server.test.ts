import { beforeEach, describe, expect, test, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';
import {
	createModerationAction,
	createQuestion,
	createUser,
	getNumberOfQuestionAudits,
	getQuestion,
	getQuestionAudit,
	makeActionEvent,
	statusOf
} from '$lib/test-utils';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

const enqueueMail = vi.hoisted(() => vi.fn());
enqueueMail.mockReturnValue(crypto.randomUUID());
vi.mock(import('$lib/server/email/outbox'), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		enqueueMail
	};
});

async function getModerationAction(questionId: string) {
	const [moderationAction] = await db
		.select()
		.from(schema.moderationAction)
		.where(eq(schema.moderationAction.questionId, questionId));
	return moderationAction;
}

type LoadData = Exclude<Awaited<ReturnType<typeof page.load>>, void>;

function makeLoadEvent(user: typeof schema.user.$inferSelect | null) {
	return { locals: { user: user ?? undefined } } as unknown as Parameters<typeof page.load>[0];
}

function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	return makeActionEvent<typeof page.actions.default>(`http://localhost/modereren`, user, fields);
}

beforeEach(async () => {
	enqueueMail.mockClear();

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
		const event = myMakeActionEvent(null, { questionId: question.id, action: 'approved' });

		expect(await statusOf(page.actions.default(event))).toBe(400);
		expect(await getQuestion(question.id)).toMatchObject({ status: 'pending' });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('moderates a question for a moderator', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, { questionId: question.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: question.id });
		expect(await getQuestion(question.id)).toMatchObject({ status: 'approved' });
		expect(enqueueMail).toHaveBeenCalled();
	});

	test('fails on an invalid form', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const event = myMakeActionEvent(moderator, { action: 'iets-anders' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('requires rejection reasons when rejecting', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'rejected',
			rejectionReason: ''
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('stores rejection reasons when rejecting', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'rejected',
			rejectionReason: 'offensive'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ moderated: question.id });
		expect((await getModerationAction(question.id)).rejectionReason).toBe('offensive');
		expect(enqueueMail).toHaveBeenCalled();
	});

	test('validates rejection reasons when rejecting', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'rejected',
			rejectionReason: 'i_do_not_exist'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('handles multiple valid rejection reasons', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'rejected',
			rejectionReason: 'offensive,duplicate'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ moderated: question.id });
		expect((await getModerationAction(question.id)).rejectionReason).toBe('offensive,duplicate');
		expect(enqueueMail).toHaveBeenCalled();
	});

	test('rejects multiple rejection reasons if one is invalid (1)', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'rejected',
			rejectionReason: 'i_do_not_exist,duplicate'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('rejects multiple rejection reasons if one is invalid (2)', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'rejected',
			rejectionReason: 'offensive,i_do_not_exist'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('ignores rejection reasons when approving', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'approved',
			rejectionReason: 'offensive'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ moderated: question.id });
		expect((await getModerationAction(question.id)).rejectionReason).toBe(null);
		expect(enqueueMail).toHaveBeenCalled();
	});

	test('reports an already handled question', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion({ status: 'approved' });
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'rejected',
			rejectionReason: 'offensive'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 409 });
		expect((await getQuestion(question.id)).status).toBe('approved');
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('reports an unverified question', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion({ verifiedAt: null });
		const event = myMakeActionEvent(moderator, { questionId: question.id, action: 'approved' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 409 });
		expect((await getQuestion(question.id)).status).toBe('pending');
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('stores a note', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const note = "This is my note for this question."
		const event = myMakeActionEvent(moderator, { questionId: question.id, note: note, action: 'pending' });

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: question.id });
		expect(await getQuestion(question.id)).toMatchObject({ status: 'pending' });
		expect(await getQuestionAudit(question.id)).toMatchObject({ note: note });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('stores each note separately', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestion();
		const note1 = "This is my first note for this question."
		const note2 = "This is my second note for this question."
		await createModerationAction(moderator, { questionId: question.id, note: note1, action: 'pending' });

		const event = myMakeActionEvent(moderator, { questionId: question.id, note: note2, action: 'pending' });

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: question.id });
		expect(await getQuestion(question.id)).toMatchObject({ status: 'pending' });
		expect(await getQuestionAudit(question.id)).toMatchObject({ note: note2 });
		expect(await getNumberOfQuestionAudits(question.id)).toBe(2);
		expect(enqueueMail).not.toHaveBeenCalled();
	});
});
