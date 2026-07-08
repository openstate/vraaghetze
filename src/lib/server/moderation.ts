import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, schema } from '$lib/server/db';

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
		const updated = await tx
			.update(schema.question)
			.set({ status: action })
			.where(
				and(
					eq(schema.question.id, questionId),
					eq(schema.question.status, 'pending'),
					isNotNull(schema.question.verifiedAt)
				)
			)
			.returning({ id: schema.question.id });

		if (updated.length === 0) return { error: 'already-handled' as const };

		await tx.insert(schema.moderationAction).values({
			id: crypto.randomUUID(),
			moderatorId,
			questionId,
			action,
			note
		});

		return { action };
	});
}
