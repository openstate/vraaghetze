import { describe, expect, test } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as reminders from './reminders';
import { createModerationAction, createPolitician, createUser } from '$lib/test-utils';
import { createAnswer, createInboxRow, createQuestion, makeEmail } from '$e2e/test-utils';
import { DAY_MS } from '$lib/general';

const between = (min: number, max: number) => min + Math.random() * (max - min);

function createdAtRecent() {
	const ms = between(
		(reminders.SEND_REMINDER_AFTER_DAYS - 10) * DAY_MS,
		(reminders.SEND_REMINDER_AFTER_DAYS - 5) * DAY_MS
	);
	return new Date(new Date().getTime() - ms);
}

function createdAtOverdue() {
	const ms = between(
		(reminders.SEND_REMINDER_AFTER_DAYS + 1) * DAY_MS,
		(reminders.SEND_REMINDER_AFTER_DAYS + 10) * DAY_MS
	);
	return new Date(new Date().getTime() - ms);
}

type CreateType = {
	asker: typeof schema.user.$inferInsert;
	politicianUser: typeof schema.user.$inferInsert;
	moderator?: typeof schema.user.$inferInsert;
	overdue: boolean;
};

async function insertQuestion(
	asker: typeof schema.user.$inferInsert,
	politician: typeof schema.user.$inferInsert,
	overrides: Partial<typeof schema.question.$inferInsert> = {}
) {
	return createQuestion(asker, politician, { status: 'approved', ...overrides });
}

async function insertQuestionAndModerationAction(
	asker: typeof schema.user.$inferInsert,
	politician: typeof schema.user.$inferInsert,
	moderator: typeof schema.user.$inferInsert,
	overrides: Partial<typeof schema.question.$inferInsert> = {},
	moderationActionOverrides: Partial<typeof schema.moderationAction.$inferInsert> = {}
) {
	const question = await createQuestion(asker, politician, { status: 'approved', ...overrides });
	const moderationAction = await createModerationAction(
		'approved',
		moderator,
		question,
		moderationActionOverrides
	);

	return { question, moderationAction };
}

const createQuestionPending = async (options: CreateType) => {
	const createdAt = options.overdue ? createdAtOverdue() : createdAtRecent();
	await insertQuestion(options.asker, options.politicianUser, {
		status: 'pending',
		createdAt: createdAt
	});
};

const createQuestionPendingWrongPolitician = async (options: CreateType) => {
	const createdAt = options.overdue ? createdAtOverdue() : createdAtRecent();
	await insertQuestionAndModerationAction(
		options.asker,
		options.politicianUser,
		options.moderator!,
		{ status: 'pending-wrong-politician', createdAt: createdAt },
		{ action: 'pending-wrong-politician', createdAt: createdAt }
	);
};

const createQuestionIgnoredDifferentSender = async (options: CreateType) => {
	const createdAt = options.overdue ? createdAtOverdue() : createdAtRecent();
	const { question } = await insertQuestionAndModerationAction(
		// p.s. status=approved
		options.asker,
		options.politicianUser,
		options.moderator!,
		{ createdAt: createdAt },
		{ createdAt: createdAt }
	);
	const email = makeEmail(options.politicianUser.email, question.emailToken);
	await createInboxRow(email, 'ignored_different_sender');
};

const createQuestionAnswerPending = async (options: CreateType) => {
	const { question } = await createQuestionApproved(options);
	await createAnswer(question);
};

const createQuestionAnswerRejected = async (options: CreateType) => {
	const { question } = await createQuestionApproved(options);
	await createAnswer(question, { status: 'rejected' });
};

const createQuestionAnswerUpdateAsker = async (options: CreateType) => {
	const { question } = await createQuestionApproved(options);
	await createAnswer(question, { status: 'update-asker' });
};

const createQuestionAnswerRejectedAndPending = async (options: CreateType) => {
	const { question } = await createQuestionApproved(options);
	await createAnswer(question, { status: 'rejected' });
	await createAnswer(question);
};

const createQuestionAnswerUpdateAskerAndPending = async (options: CreateType) => {
	const { question } = await createQuestionApproved(options);
	await createAnswer(question, { status: 'update-asker' });
	await createAnswer(question);
};

const createQuestionAnswered = async (options: CreateType) => {
	const createdAt = options.overdue ? createdAtOverdue() : createdAtRecent();
	await insertQuestionAndModerationAction(
		options.asker,
		options.politicianUser,
		options.moderator!,
		{ status: 'answered', createdAt: createdAt },
		{ createdAt: createdAt }
	);
};

export const createQuestionApproved = async (options: CreateType) => {
	const createdAt = options.overdue ? createdAtOverdue() : createdAtRecent();
	const result = await insertQuestionAndModerationAction(
		options.asker,
		options.politicianUser,
		options.moderator!,
		{ createdAt: createdAt },
		{ createdAt: createdAt }
	);

	return result;
};

const createQuestionAlreadyReminded = async (options: CreateType) => {
	const { question } = await createQuestionApproved(options);
	await db
		.update(schema.question)
		.set({ remindedAt: new Date() })
		.where(eq(schema.question.id, question.id));
};

describe('reminder stats', () => {
	test('return the correct numbers for reminders', async () => {
		const EXPECTED_N_NOT_ANSWERED = 33;
		const EXPECTED_N_OVERDUE = 23;
		const EXPECTED_N_TO_REMIND = 9;
		const EXPECTED_N_NO_REMINDER = 14;
		const reminderDate = new Date(Date.now() - reminders.SEND_REMINDER_AFTER);

		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const moderator = await createUser('Mo Moderator');
		// NA = counted in nNotAnswered
		// O  = counted in nOverdue
		// R  = counted in nToRemind
		// NR = counted in nOverdueNoReminder

		await createQuestionPending({ asker, politicianUser, overdue: false }); // NA
		await createQuestionPending({ asker, politicianUser, overdue: true }); // NA, O, NR
		await createQuestionPending({ asker, politicianUser, overdue: true }); // NA, O, NR

		await createQuestionPendingWrongPolitician({
			asker,
			politicianUser,
			moderator,
			overdue: false
		}); // NA
		await createQuestionPendingWrongPolitician({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR
		await createQuestionPendingWrongPolitician({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR

		await createQuestionIgnoredDifferentSender({
			asker,
			politicianUser,
			moderator,
			overdue: false
		}); // NA
		await createQuestionIgnoredDifferentSender({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR
		await createQuestionIgnoredDifferentSender({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR

		await createQuestionAnswerPending({ asker, politicianUser, moderator, overdue: false }); // NA
		await createQuestionAnswerPending({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR
		await createQuestionAnswerPending({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR

		await createQuestionAnswerRejected({ asker, politicianUser, moderator, overdue: false }); // NA
		await createQuestionAnswerRejected({ asker, politicianUser, moderator, overdue: true }); // NA, O, R
		await createQuestionAnswerRejected({ asker, politicianUser, moderator, overdue: true }); // NA, O, R

		await createQuestionAnswerUpdateAsker({ asker, politicianUser, moderator, overdue: false }); // NA
		await createQuestionAnswerUpdateAsker({ asker, politicianUser, moderator, overdue: true }); // NA, O, R
		await createQuestionAnswerUpdateAsker({ asker, politicianUser, moderator, overdue: true }); // NA, O, R

		await createQuestionAnswerRejectedAndPending({
			asker,
			politicianUser,
			moderator,
			overdue: false
		}); // NA
		await createQuestionAnswerRejectedAndPending({
			asker,
			politicianUser,
			moderator,
			overdue: true
		}); // NA, O, NR
		await createQuestionAnswerRejectedAndPending({
			asker,
			politicianUser,
			moderator,
			overdue: true
		}); // NA, O, NR

		await createQuestionAnswerUpdateAskerAndPending({
			asker,
			politicianUser,
			moderator,
			overdue: false
		}); // NA
		await createQuestionAnswerUpdateAskerAndPending({
			asker,
			politicianUser,
			moderator,
			overdue: true
		}); // NA, O, NR
		await createQuestionAnswerUpdateAskerAndPending({
			asker,
			politicianUser,
			moderator,
			overdue: true
		}); // NA, O, NR

		await createQuestionAnswered({ asker, politicianUser, moderator, overdue: false }); // -
		await createQuestionAnswered({ asker, politicianUser, moderator, overdue: true }); // -
		await createQuestionAnswered({ asker, politicianUser, moderator, overdue: true }); // -

		await createQuestionApproved({ asker, politicianUser, moderator, overdue: false }); // NA
		await createQuestionApproved({ asker, politicianUser, moderator, overdue: false }); // NA

		await createQuestionApproved({ asker, politicianUser, moderator, overdue: true }); // NA, O, R
		await createQuestionApproved({ asker, politicianUser, moderator, overdue: true }); // NA, O, R
		await createQuestionApproved({ asker, politicianUser, moderator, overdue: true }); // NA, O, R
		await createQuestionApproved({ asker, politicianUser, moderator, overdue: true }); // NA, O, R
		await createQuestionApproved({ asker, politicianUser, moderator, overdue: true }); // NA, O, R

		await createQuestionAlreadyReminded({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR
		await createQuestionAlreadyReminded({ asker, politicianUser, moderator, overdue: true }); // NA, O, NR

		const stats = await reminders.reminderStats(reminderDate);
		expect(stats.nNotAnswered).toBe(EXPECTED_N_NOT_ANSWERED);
		expect(stats.nOverdue).toBe(EXPECTED_N_OVERDUE);
		expect(stats.nToRemind).toBe(EXPECTED_N_TO_REMIND);
		expect(stats.nOverdueNoReminder).toBe(EXPECTED_N_NO_REMINDER);

		expect((await reminders.remindersNotAnswered()).length).toBe(EXPECTED_N_NOT_ANSWERED);
		expect((await reminders.remindersOverdue(reminderDate)).length).toBe(EXPECTED_N_OVERDUE);
		expect((await reminders.remindersToRemind(reminderDate)).length).toBe(EXPECTED_N_TO_REMIND);
		expect((await reminders.remindersOverdueNoReminder(reminderDate)).length).toBe(
			EXPECTED_N_NO_REMINDER
		);
	});
});
