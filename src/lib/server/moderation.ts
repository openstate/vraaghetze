import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, schema } from '$lib/server/db';
import { enqueueApprovalMails, enqueueRejectionMail } from '$lib/server/mails';

const politicianUser = alias(schema.user, 'politicianUser');

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

		if (!question) return { error: 'already-handled' as const };

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
