import { and, asc, count, desc, eq, gt, isNotNull, isNull, ne, notExists, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import {
	enqueueAnswerMail,
	enqueueApprovalMails,
	enqueueFollowerMails,
	enqueueRejectionMail
} from '$lib/server/email/templates';
import { newerAnswer } from '$lib/server/questions';
import { hasPermission } from '$lib/permissions';
import type { Pagination } from '$lib/pagination';

const politicianUser = alias(schema.user, 'politicianUser');
const moderatorUser = alias(schema.user, 'moderatorUser');

const AUTOMATIC_REJECTION_NOTE =
	'Automatisch genegeerd omdat een ander antwoord op deze vraag is goedgekeurd.';

// a question can have several answers, so join only the newest one. unlike the version in
// questions.ts, moderation sees every status
const latestAnswer = and(
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

// require user to have the "moderate" permission, otherwise returns 403 page
export function authorizeModerator(user: App.Locals['user']) {
	if (!hasPermission(user, { question: ['moderate'] })) error(403, 'Geen toegang');
}

// only verified questions enter the queue; unverified ones get their own list with a
// manual-verify action in a later phase
export function listQuestionQueue() {
	return db
		.select({
			id: schema.question.id,
			slug: schema.question.slug,
			title: schema.question.title,
			body: schema.question.body,
			createdAt: schema.question.createdAt,
			authorName: schema.user.name,
			politicianName: politicianUser.name,
			politicianSlug: schema.politician.slug,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.where(and(eq(schema.question.status, 'pending'), isNotNull(schema.question.verifiedAt)))
		.orderBy(asc(schema.question.createdAt));
}

// a politician often replies automatically before replying for real, so every answer is
// checked by a moderator, who needs the question to judge whether the reply answers it
export function listAnswerQueue() {
	return db
		.select({
			id: schema.answer.id,
			body: schema.answer.body,
			createdAt: schema.answer.createdAt,
			questionTitle: schema.question.title,
			questionBody: schema.question.body,
			questionSlug: schema.question.slug,
			questionCreatedAt: schema.question.createdAt,
			authorName: schema.user.name,
			politicianName: politicianUser.name,
			politicianSlug: schema.politician.slug,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.answer)
		.innerJoin(schema.question, eq(schema.answer.questionId, schema.question.id))
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.where(eq(schema.answer.status, 'pending'))
		.orderBy(asc(schema.answer.createdAt));
}

// the sizes behind the tab labels, so a moderator sees what is waiting from any page
export function countQueues() {
	return db.transaction(async (tx) => {
		const [questions] = await tx
			.select({ total: count() })
			.from(schema.question)
			.where(and(eq(schema.question.status, 'pending'), isNotNull(schema.question.verifiedAt)));

		const [answers] = await tx
			.select({ total: count() })
			.from(schema.answer)
			.where(eq(schema.answer.status, 'pending'));

		return { questions: questions.total, answers: answers.total };
	});
}

export function listQuestions({ page, perPage }: Pagination) {
	return db.transaction(async (tx) => {
		const rows = await tx
			.select({
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
				moderatorName: moderatorUser.name,
				moderatedAt: schema.moderationAction.createdAt,
				rejectionReason: schema.moderationAction.rejectionReason,
				note: schema.moderationAction.note
			})
			.from(schema.question)
			.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
			.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
			.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
			.leftJoin(schema.answer, latestAnswer)
			.leftJoin(schema.moderationAction, eq(schema.moderationAction.questionId, schema.question.id))
			.leftJoin(moderatorUser, eq(schema.moderationAction.moderatorId, moderatorUser.id))
			.orderBy(desc(schema.question.createdAt))
			.limit(perPage)
			.offset((page - 1) * perPage);

		const [{ total }] = await tx.select({ total: count() }).from(schema.question);

		return { rows, total };
	});
}

export function listInbox({ page, perPage }: Pagination) {
	return db.transaction(async (tx) => {
		const rows = await tx
			.select({
				id: schema.inbox.id,
				fromAddress: schema.inbox.fromAddress,
				subject: schema.inbox.subject,
				body: sql<string | null>`${schema.inbox.payload}->>'text'`,
				status: schema.inbox.status,
				reason: schema.inbox.reason,
				receivedAt: schema.inbox.receivedAt,
				processedAt: schema.inbox.processedAt
			})
			.from(schema.inbox)
			.orderBy(desc(schema.inbox.receivedAt))
			.limit(perPage)
			.offset((page - 1) * perPage);

		const [{ total }] = await tx.select({ total: count() }).from(schema.inbox);

		return { rows, total };
	});
}

export function listOutbox({ page, perPage }: Pagination) {
	return db.transaction(async (tx) => {
		const rows = await tx
			.select({
				id: schema.outbox.id,
				kind: schema.outbox.kind,
				recipient: schema.outbox.recipient,
				replyTo: schema.outbox.replyTo,
				subject: schema.outbox.subject,
				body: schema.outbox.body,
				status: schema.outbox.status,
				attempts: schema.outbox.attempts,
				lastError: schema.outbox.lastError,
				sentAt: schema.outbox.sentAt,
				createdAt: schema.outbox.createdAt
			})
			.from(schema.outbox)
			.orderBy(desc(schema.outbox.createdAt))
			.limit(perPage)
			.offset((page - 1) * perPage);

		const [{ total }] = await tx.select({ total: count() }).from(schema.outbox);

		return { rows, total };
	});
}

type QuestionModeration = {
	questionId: string;
	moderatorId: string;
	action: 'approved' | 'rejected';
	note?: string;
	rejectionReason?: string
};

export function moderateQuestion({ questionId, moderatorId, action, note, rejectionReason }: QuestionModeration) {
	return db.transaction(async (tx) => {
		// the guard makes double-clicks and concurrent moderators a no-op instead of a
		// double action, and ensures only verified questions are ever approved/rejected
		const [question] = await tx
			.update(schema.question)
			.set(
				action === 'approved'
					? { status: action, emailToken: crypto.randomUUID() }
					: { status: action }
			)
			.where(
				and(
					eq(schema.question.id, questionId),
					eq(schema.question.status, 'pending'),
					isNotNull(schema.question.verifiedAt)
				)
			)
			.returning({
				id: schema.question.id,
				title: schema.question.title,
				body: schema.question.body,
				slug: schema.question.slug,
				userId: schema.question.userId,
				assigneeId: schema.question.assigneeId,
				emailToken: schema.question.emailToken
			});

		if (!question) {
			// tell an unverified question apart from an already moderated one, so the
			// moderator isn't told a never-handled question was already handled
			const [unverified] = await tx
				.select({ id: schema.question.id })
				.from(schema.question)
				.where(
					and(
						eq(schema.question.id, questionId),
						eq(schema.question.status, 'pending'),
						isNull(schema.question.verifiedAt)
					)
				)
				.limit(1);

			return { error: unverified ? ('not-verified' as const) : ('already-handled' as const) };
		}

		await tx.insert(schema.moderationAction).values({
			id: crypto.randomUUID(),
			moderatorId,
			questionId,
			action,
			rejectionReason,
			note
		});

		// enqueue notification emails to asker/politician on the moderated question
		if (action === 'approved') await enqueueApprovalMails(tx, question);
		else await enqueueRejectionMail(tx, question);

		return { action };
	});
}

type AnswerModeration = {
	answerId: string;
	moderatorId: string;
	action: 'approved' | 'rejected';
};

export function moderateAnswer({ answerId, moderatorId, action }: AnswerModeration) {
	return db.transaction(async (tx) => {
		// same guard as on questions: a double-click or a second moderator is a no-op
		const [answer] = await tx
			.update(schema.answer)
			.set({ status: action })
			.where(and(eq(schema.answer.id, answerId), eq(schema.answer.status, 'pending')))
			.returning({ questionId: schema.answer.questionId });

		if (!answer) {
			return { error: 'already-handled' as const };
		}

		await tx.insert(schema.moderationAction).values({
			id: crypto.randomUUID(),
			moderatorId,
			answerId,
			action
		});

		if (action === 'rejected') {
			return { action };
		}

		// the other replies to this same question can be rejected
		const otherAnswers = await tx
			.update(schema.answer)
			.set({ status: 'rejected' })
			.where(
				and(
					eq(schema.answer.questionId, answer.questionId),
					eq(schema.answer.status, 'pending'),
					ne(schema.answer.id, answerId)
				)
			)
			.returning({ id: schema.answer.id });

		if (otherAnswers.length > 0) {
			await tx.insert(schema.moderationAction).values(
				otherAnswers.map((other) => ({
					id: crypto.randomUUID(),
					moderatorId,
					answerId: other.id,
					action: 'rejected' as const,
					note: AUTOMATIC_REJECTION_NOTE
				}))
			);
		}

		const [question] = await tx
			.select({
				id: schema.question.id,
				title: schema.question.title,
				slug: schema.question.slug,
				askerName: schema.user.name,
				askerEmail: schema.user.email,
				politicianName: politicianUser.name
			})
			.from(schema.question)
			.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
			.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
			.where(eq(schema.question.id, answer.questionId))
			.limit(1);

		// notify the asker that their question has been answered, and everyone following it
		await enqueueAnswerMail(tx, question);
		await enqueueFollowerMails(tx, question);

		return { action };
	});
}
