import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as moderation from './moderation';
import { createQuestion, createUser, getAnswer, getAnswerAudit, getQuestion } from '$lib/test-utils';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

async function createAnswer(
	question: { id: string; assigneeId: string },
	overrides: Partial<typeof schema.answer.$inferInsert> = {}
) {
	const [answer] = await db
		.insert(schema.answer)
		.values({
			id: crypto.randomUUID(),
			questionId: question.id,
			userId: question.assigneeId,
			body: 'Mijn antwoord op uw vraag.',
			...overrides
		})
		.returning();

	return answer;
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

describe('listQuestionQueue', () => {
	test('lists only verified pending questions, oldest first', async () => {
		const older = await createQuestion({ createdAt: new Date('2026-07-01') });
		const newer = await createQuestion({ createdAt: new Date('2026-07-10') });
		await createQuestion({ verifiedAt: null });
		await createQuestion({ status: 'approved' });
		await createQuestion({ status: 'rejected' });

		const queue = await moderation.listQuestionQueue();

		expect(queue.map((row) => row.id)).toEqual([older.question.id, newer.question.id]);
	});
});

describe('listAnswerQueue', () => {
	test('lists only pending answers, oldest first', async () => {
		const { question, asker } = await createQuestion({ status: 'approved' });
		const older = await createAnswer(question, { createdAt: new Date('2026-07-01') });
		const newer = await createAnswer(question, { createdAt: new Date('2026-07-10') });
		await createAnswer(question, { status: 'approved' });
		await createAnswer(question, { status: 'rejected' });

		const queue = await moderation.listAnswerQueue();

		expect(queue.map((row) => row.id)).toEqual([older.id, newer.id]);
		expect(queue[0]).toMatchObject({
			body: 'Mijn antwoord op uw vraag.',
			questionTitle: question.title,
			questionBody: question.body,
			questionSlug: question.slug,
			authorName: asker.name,
			politicianName: 'Jan Jansen'
		});
	});
});

describe('countQueues', () => {
	test('counts what is waiting in both queues', async () => {
		const { question } = await createQuestion();
		await createQuestion({ verifiedAt: null });
		await createQuestion({ status: 'approved' });

		await createAnswer(question);
		await createAnswer(question);
		await createAnswer(question, { status: 'approved' });

		expect(await moderation.countQueues()).toEqual({ questions: 1, answers: 2 });
	});
});

describe('moderateAnswer', () => {
	test('approves an answer and notifies the asker and the followers', async () => {
		const { question, asker, politician } = await createQuestion({ status: 'approved' });
		const answer = await createAnswer(question);
		const moderator = await createUser('Mo Moderator');
		const follower = await createUser('Fatima Volger');

		await db
			.insert(schema.questionFollow)
			.values({ id: crypto.randomUUID(), questionId: question.id, userId: follower.id });

		const result = await moderation.moderateAnswer({
			answerId: answer.id,
			moderatorId: moderator.id,
			action: 'approved'
		});

		expect(result).toEqual({ action: 'approved' });
		expect((await getAnswer(answer.id)).status).toBe('approved');

		expect(await getAnswerAudit(answer.id)).toMatchObject([
			{ moderatorId: moderator.id, action: 'approved', note: null, questionId: null }
		]);

		const mails = await getEnqueuedMails(question.id);
		expect(mails).toHaveLength(2);
		const askerMail = mails.find((mail) => mail.kind === 'answer-notification');
		expect(askerMail).toMatchObject({ recipient: asker.email });
		expect(askerMail?.body).toContain(politician.name);
		expect(mails.find((mail) => mail.kind === 'follow-notification')).toMatchObject({
			recipient: follower.email
		});
	});

	test('ignores an answer without mailing anyone', async () => {
		const { question } = await createQuestion({ status: 'approved' });
		const answer = await createAnswer(question);
		const moderator = await createUser('Mo Moderator');

		const result = await moderation.moderateAnswer({
			answerId: answer.id,
			moderatorId: moderator.id,
			action: 'rejected'
		});

		expect(result).toEqual({ action: 'rejected' });
		expect((await getAnswer(answer.id)).status).toBe('rejected');
		expect(await getAnswerAudit(answer.id)).toHaveLength(1);
		expect(await getEnqueuedMails(question.id)).toHaveLength(0);
	});

	test('ignores the other waiting answers when one is approved', async () => {
		const { question } = await createQuestion({ status: 'approved' });
		const automatic = await createAnswer(question, { body: 'Ik ben afwezig tot 1 september.' });
		const real = await createAnswer(question);
		const moderator = await createUser('Mo Moderator');

		await moderation.moderateAnswer({
			answerId: real.id,
			moderatorId: moderator.id,
			action: 'approved'
		});

		expect((await getAnswer(automatic.id)).status).toBe('rejected');
		expect(await getAnswerAudit(automatic.id)).toMatchObject([
			{ moderatorId: moderator.id, action: 'rejected' }
		]);
		expect(await moderation.listAnswerQueue()).toHaveLength(0);
	});

	test('treats a second moderation of the same answer as already handled', async () => {
		const { question } = await createQuestion({ status: 'approved' });
		const answer = await createAnswer(question);
		const moderator = await createUser('Mo Moderator');

		const first = await moderation.moderateAnswer({
			answerId: answer.id,
			moderatorId: moderator.id,
			action: 'approved'
		});
		const second = await moderation.moderateAnswer({
			answerId: answer.id,
			moderatorId: moderator.id,
			action: 'rejected'
		});

		expect(first).toEqual({ action: 'approved' });
		expect(second).toEqual({ error: 'already-handled' });
		expect((await getAnswer(answer.id)).status).toBe('approved');
		expect(await getAnswerAudit(answer.id)).toHaveLength(1);
		expect(await getEnqueuedMails(question.id)).toHaveLength(1);
	});
});

describe('moderateQuestion', () => {
	test('approves a question, mints a reply token and mails both parties', async () => {
		const { question, asker, politician } = await createQuestion();
		const moderator = await createUser('Mo Moderator');

		const result = await moderation.moderateQuestion({
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

		await moderation.moderateQuestion({
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

		const result = await moderation.moderateQuestion({
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

		const first = await moderation.moderateQuestion({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'approved'
		});
		const second = await moderation.moderateQuestion({
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

		const result = await moderation.moderateQuestion({
			questionId: question.id,
			moderatorId: moderator.id,
			action: 'approved'
		});

		expect(result).toEqual({ error: 'not-verified' });
		expect((await getQuestion(question.id)).status).toBe('pending');
		expect(await getEnqueuedMails(question.id)).toHaveLength(0);
	});
});
