import {
	count,
	sql,
	eq,
	gt,
	ne,
	desc,
	and,
	lt,
	inArray,
	countDistinct,
	isNull,
	or,
	isNotNull,
	notExists
} from 'drizzle-orm';
import { alias, type PgSelect } from 'drizzle-orm/pg-core';
import { db, schema, type Transaction } from './db';
import type { ListQuestionType } from './moderation';
import { DAY_MS } from '$lib/general';

export const SEND_REMINDER_AFTER_DAYS = 14;
export const SEND_REMINDER_AFTER = SEND_REMINDER_AFTER_DAYS * DAY_MS;

export type ReminderStats = 'nNotAnswered' | 'nOverdue' | 'nToRemind' | 'nOverdueNoReminder';

const politicianUser = alias(schema.user, 'politicianUser');
const newerAnswer = alias(schema.answer, 'newerAnswer');
const pendingAnswer = alias(schema.answer, 'pendingAnswer');

export const reminderStats = async (reminderDate: Date): Promise<Record<ReminderStats, number>> => {
	// Total not answered
	const nNotAnswered = await reminderStatNotAnswered();

	// Number of questions overdue
	const nOverdue = await reminderStatOverdue(reminderDate);

	const nToRemind = await reminderStatToRemind(reminderDate);

	const nOverdueNoReminder = await reminderStatOverdueNoReminder(reminderDate);

	return {
		nNotAnswered,
		nOverdue,
		nToRemind,
		nOverdueNoReminder
	};
};

const latestAnswerModeratorView = and(
	eq(schema.answer.questionId, schema.question.id),
	notExists(
		db
			.select({ newer: sql`1` })
			.from(newerAnswer)
			.where(
				and(
					eq(newerAnswer.questionId, schema.question.id),
					gt(newerAnswer.createdAt, schema.answer.createdAt)
				)
			)
	)
);

const questionStatFields = {
	id: schema.question.id,
	title: schema.question.title,
	body: schema.question.body,
	slug: schema.question.slug,
	status: schema.question.status,
	authorName: schema.user.name,
	politicianName: politicianUser.name,
	politicianSlug: schema.politician.slug,
	createdAt: schema.question.createdAt,
	answeredAt: schema.answer.createdAt,
	answerStatus: schema.answer.status,
	moderatorName: sql<null>`null`,
	moderatedAt: sql<null>`null`,
	rejectionReason: sql<null>`null`,
	note: sql<null>`null`,
	verifiedAt: schema.question.verifiedAt
} as const;

const remindersNotAnsweredFilter = async <T extends PgSelect>(q: T) => {
	const result = await q
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
		.leftJoin(schema.answer, latestAnswerModeratorView)
		.where(ne(schema.question.status, 'answered'));

	return result;
};

const reminderStatNotAnswered = async () => {
	const [{ nTotal: nNotAnswered }] = await remindersNotAnsweredFilter(
		db.select({ nTotal: count() }).from(schema.question).$dynamic()
	);

	return nNotAnswered;
};

export const remindersNotAnswered = async () => {
	const questions: ListQuestionType[] = await remindersNotAnsweredFilter(
		db
			.selectDistinct(questionStatFields)
			.from(schema.question)
			.orderBy(desc(schema.question.createdAt))
			.$dynamic()
	);

	return questions;
};
const remindersOverdueFilter1 = async <T extends PgSelect>(q: T, reminderDate: Date) => {
	const result = await q
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
		.leftJoin(schema.answer, latestAnswerModeratorView)
		.innerJoin(schema.moderationAction, eq(schema.question.id, schema.moderationAction.questionId))
		.where(
			and(
				eq(schema.question.status, 'approved'),
				eq(schema.moderationAction.action, 'approved'),
				lt(schema.moderationAction.createdAt, reminderDate)
			)
		);

	return result;
};
const remindersOverdueFilter2 = async <T extends PgSelect>(q: T, reminderDate: Date) => {
	const result = await q
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
		.leftJoin(schema.answer, latestAnswerModeratorView)
		.where(
			and(
				inArray(schema.question.status, ['pending', 'pending-wrong-politician']),
				lt(schema.question.createdAt, reminderDate)
			)
		);

	return result;
};
const reminderStatOverdue = async (reminderDate: Date) => {
	const [{ nTotal: nOverdue1 }] = await remindersOverdueFilter1(
		db
			.select({ nTotal: countDistinct(schema.question.id) })
			.from(schema.question)
			.$dynamic(),
		reminderDate
	);

	const [{ nTotal: nOverdue2 }] = await remindersOverdueFilter2(
		db
			.select({ nTotal: countDistinct(schema.question.id) })
			.from(schema.question)
			.$dynamic(),
		reminderDate
	);

	return nOverdue1 + nOverdue2;
};

export const remindersOverdue = async (reminderDate: Date) => {
	const questions1: ListQuestionType[] = await remindersOverdueFilter1(
		db
			.selectDistinct(questionStatFields)
			.from(schema.question)
			.orderBy(desc(schema.question.createdAt))
			.$dynamic(),
		reminderDate
	);

	const questions2: ListQuestionType[] = await remindersOverdueFilter2(
		db
			.selectDistinct(questionStatFields)
			.from(schema.question)
			.orderBy(desc(schema.question.createdAt))
			.$dynamic(),
		reminderDate
	);

	const questions = questions1.concat(questions2);
	questions.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

	return questions;
};
const remindersToRemindFilter = async <T extends PgSelect>(q: T, reminderDate: Date) => {
	// All approved and overdue questions, except:
	// 	- with an non-rejected answer
	//  - with an inbox entry with status ignored_different_sender
	const pendingAnswerQuery = db
		.select({ id: pendingAnswer.id })
		.from(pendingAnswer)
		.where(
			and(
				eq(pendingAnswer.status, 'pending'),
				eq(pendingAnswer.questionId, schema.answer.questionId)
			)
		);

	const result = await q
		.innerJoin(schema.moderationAction, eq(schema.question.id, schema.moderationAction.questionId))
		.leftJoin(schema.answer, eq(schema.answer.questionId, schema.question.id))
		.leftJoin(
			schema.inbox,
			and(
				eq(schema.inbox.token, schema.question.emailToken),
				eq(schema.inbox.status, 'ignored_different_sender')
			)
		)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
		.where(
			and(
				eq(schema.question.status, 'approved'),
				isNull(schema.question.remindedAt),
				eq(schema.moderationAction.action, 'approved'),
				lt(schema.moderationAction.createdAt, reminderDate),
				notExists(pendingAnswerQuery),
				isNull(schema.inbox.id)
			)
		);

	return result;
};

const reminderStatToRemind = async (reminderDate: Date) => {
	const [{ nTotal: nToRemind }] = await remindersToRemindFilter(
		db
			.select({ nTotal: countDistinct(schema.question.id) })
			.from(schema.question)
			.$dynamic(),
		reminderDate
	);

	return nToRemind;
};

export const remindersToRemind = async (reminderDate: Date) => {
	const questions: ListQuestionType[] = await remindersToRemindFilter(
		db
			.selectDistinct(questionStatFields) // TODO: may select questions multiple times due to fields from other tables in questionStatFields
			.from(schema.question)
			.orderBy(desc(schema.question.createdAt))
			.$dynamic(),
		reminderDate
	);

	return questions;
};

const remindersOverdueNoReminderFilter1 = async <T extends PgSelect>(q: T, reminderDate: Date) => {
	// Approved questions with an answer with status pending or with an inbox entry with status ignored_different_sender
	const result = await q
		.innerJoin(schema.moderationAction, eq(schema.question.id, schema.moderationAction.questionId))
		.leftJoin(
			schema.answer,
			and(eq(schema.answer.questionId, schema.question.id), eq(schema.answer.status, 'pending'))
		)
		.leftJoin(
			schema.inbox,
			and(
				eq(schema.inbox.token, schema.question.emailToken),
				eq(schema.inbox.status, 'ignored_different_sender')
			)
		)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
		.where(
			and(
				eq(schema.question.status, 'approved'),
				eq(schema.moderationAction.action, 'approved'),
				lt(schema.moderationAction.createdAt, reminderDate),
				or(
					isNotNull(schema.answer.id),
					isNotNull(schema.inbox.id),
					isNotNull(schema.question.remindedAt)
				)
			)
		);

	return result;
};
const remindersOverdueNoReminderFilter2 = async <T extends PgSelect>(q: T, reminderDate: Date) => {
	const result = await q
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
		.leftJoin(schema.answer, latestAnswerModeratorView)
		.where(
			and(
				inArray(schema.question.status, ['pending', 'pending-wrong-politician']),
				lt(schema.question.createdAt, reminderDate)
			)
		);

	return result;
};
const reminderStatOverdueNoReminder = async (reminderDate: Date) => {
	const [{ nTotal: nOverdueNoReminder1 }] = await remindersOverdueNoReminderFilter1(
		db
			.select({ nTotal: countDistinct(schema.question.id) })
			.from(schema.question)
			.$dynamic(),
		reminderDate
	);

	const [{ nTotal: nOverdueNoReminder2 }] = await remindersOverdueNoReminderFilter2(
		db.select({ nTotal: count() }).from(schema.question).$dynamic(),
		reminderDate
	);

	return nOverdueNoReminder1 + nOverdueNoReminder2;
};

export const remindersOverdueNoReminder = async (reminderDate: Date) => {
	const questions1: ListQuestionType[] = await remindersOverdueNoReminderFilter1(
		db
			.selectDistinct(questionStatFields)
			.from(schema.question)
			.orderBy(desc(schema.question.createdAt))
			.$dynamic(),
		reminderDate
	);

	const questions2: ListQuestionType[] = await remindersOverdueNoReminderFilter2(
		db
			.selectDistinct(questionStatFields)
			.from(schema.question)
			.orderBy(desc(schema.question.createdAt))
			.$dynamic(),
		reminderDate
	);

	const questions = questions1.concat(questions2);
	questions.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

	return questions;
};

export const setRemindedAt = async (
	tx: Transaction,
	questionId: string
) => {
	await tx
		.update(schema.question)
		.set({ remindedAt: new Date() })
		.where(eq(schema.question.id, questionId));
};