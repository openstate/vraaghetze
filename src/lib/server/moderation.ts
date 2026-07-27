import { and, asc, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import { enqueueApprovalMails, enqueueRejectionMail } from '$lib/server/email/templates';
import { hasPermission } from '$lib/permissions';
import type { Pagination } from '$lib/pagination';

const politicianUser = alias(schema.user, 'politicianUser');

// require user to have the "moderate" permission, otherwise returns 403 page
export function authorizeModerator(user: App.Locals['user']) {
	if (!hasPermission(user, { question: ['moderate'] })) error(403, 'Geen toegang');
}

// only verified questions enter the queue; unverified ones get their own list with a
// manual-verify action in a later phase
export function listQueue() {
	return db
		.select({
			id: schema.question.id,
			slug: schema.question.slug,
			title: schema.question.title,
			body: schema.question.body,
			createdAt: schema.question.createdAt,
			authorName: schema.user.name,
			politicianName: politicianUser.name,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.where(and(eq(schema.question.status, 'pending'), isNotNull(schema.question.verifiedAt)))
		.orderBy(asc(schema.question.createdAt));
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
				answeredAt: schema.answer.createdAt
			})
			.from(schema.question)
			.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
			.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
			.leftJoin(schema.politician, eq(schema.politician.userId, schema.question.assigneeId))
			.leftJoin(schema.answer, eq(schema.answer.questionId, schema.question.id))
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
				receivedAt: schema.inbox.receivedAt
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
				subject: schema.outbox.subject,
				body: schema.outbox.body,
				status: schema.outbox.status,
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

type Moderation = {
	questionId: string;
	moderatorId: string;
	action: 'approved' | 'rejected';
	note?: string;
};

export function moderate({ questionId, moderatorId, action, note }: Moderation) {
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
			note
		});

		// enqueue notification emails to asker/politician on the moderated question
		if (action === 'approved') await enqueueApprovalMails(tx, question);
		else await enqueueRejectionMail(tx, question);

		return { action };
	});
}
