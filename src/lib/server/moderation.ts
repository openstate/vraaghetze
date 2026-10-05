import { and, asc, count, desc, eq, gt, isNotNull, isNull, ne, notExists, sql, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { error } from '@sveltejs/kit';
import { db, schema, type Transaction } from '$lib/server/db';
import {
	enqueueAnswerMail,
	enqueueApprovalMails,
	enqueueFollowerMails,
	enqueueProposedPoliticianMail,
	enqueueRejectionMail
} from '$lib/server/email/templates';
import { getStatus, newerAnswer, updatePolitician, type QuestionType } from '$lib/server/questions';
import { hasPermission } from '$lib/permissions';
import type { Pagination } from '$lib/pagination';
import type { MetaType, ModerationAction, QuestionStatus } from './db/app.schema';
import type { PoliticianType } from './politicians';

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

// require user to have the "admin" permission, otherwise returns 403 page
export function authorizeAdmin(user: App.Locals['user']) {
	if (!hasPermission(user, { user: ['create'] })) error(403, 'Geen toegang');
}

export type ListQuestionType = {
	id: string;
	slug: string;
	title: string;
	body: string;
	status: QuestionStatus;
	createdAt: Date;
	authorName: string;
	politicianName: string;
	politicianSlug: string;
	fraction: string | null;
	fractionName: string | null;
};

// only verified questions enter the queue; unverified ones get their own list with a
// manual-verify action in a later phase
export async function listQuestionQueue() {
	const rows = await db
		.select({
			question: {
				id: schema.question.id,
				slug: schema.question.slug,
				title: schema.question.title,
				body: schema.question.body,
				status: schema.question.status,
				createdAt: schema.question.createdAt,
				authorName: schema.user.name,
				politicianName: politicianUser.name,
				politicianSlug: schema.politician.slug,
				fraction: schema.fraction.abbreviation,
				fractionName: schema.fraction.name
			},
			moderationAction: schema.moderationAction
		})
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.leftJoin(schema.moderationAction, eq(schema.question.id, schema.moderationAction.questionId))
		.where(and(inArray(schema.question.status, ['pending', 'pending-wrong-politician']), isNotNull(schema.question.verifiedAt)))
		.orderBy(asc(schema.question.createdAt), asc(schema.moderationAction.createdAt));

	// rows contain question-moderationAction pairs ({question: question, moderationAction: moderationAction}).
	// If a question has multiple moderationActions there are multiple rows with the same question but different moderationAction.
	// The rewrite to results keeps the ordering of both questions and moderationActions intact.
	const results: { question: ListQuestionType; moderationActions: typeof schema.moderationAction.$inferSelect[] }[] = [];
	let questionId = '';
	let index = -1;
	for (const row of rows) {
		const { question, moderationAction } = row;
		if (questionId !== question.id) {
			questionId = question.id;
			index += 1;
			results.push({ question, moderationActions: []});
		}
		if (moderationAction) {
			results[index].moderationActions.push(moderationAction);
		}
	}

	return results;
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

export type ListAnswerType = Awaited<ReturnType<typeof listAnswerQueue>>[number];

export function getAnswer(answerId: string) {
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
		.where(and(eq(schema.answer.id, answerId), eq(schema.answer.status, 'pending')));
}

// the sizes behind the tab labels, so a moderator sees what is waiting from any page
export function countQueues() {
	return db.transaction(async (tx) => {
		const [questions] = await tx
			.select({ total: count() })
			.from(schema.question)
			.where(and(inArray(schema.question.status, ['pending', 'pending-wrong-politician']), isNotNull(schema.question.verifiedAt)));

		const [answers] = await tx
			.select({ total: count() })
			.from(schema.answer)
			.where(eq(schema.answer.status, 'pending'));

		return { questions: questions.total, answers: answers.total };
	});
}

export function listQuestions({ page, perPage }: Pagination) {
	const sq = db
		.select({
			questionId: schema.moderationAction.questionId,
			moderatorId: schema.moderationAction.moderatorId,
			moderatedAt: schema.moderationAction.createdAt,
			rejectionReason: schema.moderationAction.rejectionReason,
			note: schema.moderationAction.note,
		})
		.from(schema.moderationAction)
		.orderBy(desc(schema.moderationAction.createdAt))
		.limit(1)
		.as('sq');

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
				moderatedAt: sq.moderatedAt,
				rejectionReason: sq.rejectionReason,
				note: sq.note,
				verifiedAt: schema.question.verifiedAt
			})
			.from(schema.question)
			.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
			.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
			.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
			.leftJoin(schema.answer, latestAnswer)
			.leftJoin(sq, eq(sq.questionId, schema.question.id))
			.leftJoin(moderatorUser, eq(sq.moderatorId, moderatorUser.id))
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

export async function getInboxMail(id: string) {
	const [mail] = await db.select().from(schema.inbox).where(eq(schema.inbox.id, id)).limit(1);
	return mail;
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

export function actionToStatus(action: ModerationAction, currentStatus: QuestionStatus): QuestionStatus {
	if (['pending', 'pending-wrong-politician', 'rejected', 'approved'].includes(action)) return action as QuestionStatus;

	return currentStatus;
}

type QuestionModeration = {
	questionId: string;
	moderatorId: string;
	action: ModerationAction;
	note?: string;
	proposedPolitician?: PoliticianType;
	rejectionReason?: string;
	meta?: MetaType;
	createdAtOffset?: boolean
	tx?: Transaction
};

export async function moderateQuestion(args: QuestionModeration) {
	if (args.tx) {
		return await moderateQuestionImplementation(args);
	} else {
		return await db.transaction(async (tx) => {
			return await moderateQuestionImplementation({...args, tx});
		});
	}
}

async function moderateQuestionImplementation({
	questionId,
	moderatorId,
	action,
	note,
	proposedPolitician,
	rejectionReason,
	meta,
	createdAtOffset,
	tx
}: QuestionModeration) {
	// the guard makes double-clicks and concurrent moderators a no-op instead of a
	// double action, and ensures only verified questions are ever approved/rejected
	if (!tx) throw new Error("No transaction to run moderateQuestion in");
	const currentStatus = await getStatus(questionId);
	const questionStatus = actionToStatus(action, currentStatus);
	const [question] = await tx
		.update(schema.question)
		.set(
			action === 'approved'
				? { status: questionStatus, emailToken: crypto.randomUUID() }
				: { status: questionStatus }
		)
		.where(
			and(
				eq(schema.question.id, questionId),
				inArray(schema.question.status, ['pending', 'pending-wrong-politician']),
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
					inArray(schema.question.status, ['pending', 'pending-wrong-politician']),
					isNull(schema.question.verifiedAt)
				)
			)
			.limit(1);

		return { error: unverified ? ('not-verified' as const) : ('already-handled' as const) };
	}

	if (!meta) {
		if (action === 'pending-wrong-politician' && proposedPolitician) {
			meta = {proposedPoliticianSlug: proposedPolitician.slug}
		}
	}
	
	// When creating multiple derationAction's in a single transaction they will receive the same createdAt and ordering will be undecided.
	// This offset is an ugly solution to keep ordering functional. 
	const createdAt = createdAtOffset ? new Date(Date.now() + 1000) : new Date();
	await tx.insert(schema.moderationAction).values({
		id: crypto.randomUUID(),
		moderatorId,
		questionId,
		action,
		rejectionReason,
		note,
		meta,
		createdAt
	});

	// enqueue notification emails to asker/politician on the moderated question
	if (action === 'approved') await enqueueApprovalMails(tx, question);
	else if (action === 'rejected') await enqueueRejectionMail(tx, question, rejectionReason ?? '');
	else if (action === 'pending-wrong-politician' && proposedPolitician) await enqueueProposedPoliticianMail(tx, question, proposedPolitician);

	return { action };
}

type AutomatedPoliticianChangeType = {
	accepted: boolean;
	question: QuestionType;
	moderationAction: typeof schema.moderationAction.$inferSelect;
	currentPolitician: PoliticianType;
	proposedPolitician: PoliticianType;
}

export async function automatedPoliticianChange({
	accepted,
	question,
	moderationAction,
	currentPolitician,
	proposedPolitician
}: AutomatedPoliticianChangeType) {

	if (accepted) {
		await db.transaction(async (tx) => {
			await updatePolitician(question.id, proposedPolitician.userId, proposedPolitician.fractionId, tx);

			await moderateQuestion({
				questionId: question.id,
				moderatorId: moderationAction.moderatorId,
				action: 'politician-changed',
				note: `Geautomatiseerde notitie: na bevestiging door vrager Kamerlid aangepast van ${currentPolitician.slug} naar ${proposedPolitician.slug}.`,
				meta: {currentSlug: currentPolitician.slug, newSlug: proposedPolitician.slug},
				tx
			});

			await moderateQuestion({
				questionId: question.id,
				moderatorId: moderationAction.moderatorId,
				action: 'approved',
				note: `Geautomatiseerde notitie: deze vraag werd automatisch goedgekeurd na bevestiging door vrager om Kamerlid aan te passen.`,
				createdAtOffset: true,
				tx
			});
		});
	} else {
		await moderateQuestion({
			questionId: question.id,
			moderatorId: moderationAction.moderatorId,
			action: 'rejected',
			rejectionReason: 'politician_change_rejected',
			note: `Geautomatiseerde notitie: deze vraag werd automatisch afgekeurd na bevestiging door vrager om Kamerlid niet aan te passen.`,
			meta: {currentSlug: currentPolitician.slug, newSlug: proposedPolitician.slug}
		});
	}
}

export async function getProposedPoliticianModerationAction(question: QuestionType) {
	const [moderationAction] = await db
			.select()
			.from(schema.moderationAction)
			.where(and(eq(schema.moderationAction.questionId, question.id), eq(schema.moderationAction.action, 'pending-wrong-politician')))
			.orderBy(desc(schema.moderationAction.createdAt))
			.limit(1);

			return moderationAction;
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
