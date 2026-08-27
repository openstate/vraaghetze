import { and, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import { cardColumns, latestAnswer, nestAnswer, politicianUser } from '$lib/server/questions';

export async function countForQuestion(questionId: string, viewerId: string | null) {
	const [state] = await db
		.select({
			followers: count(),
			isFollowing: sql<boolean>`coalesce(bool_or(${schema.questionFollow.userId} = ${viewerId}), false)`
		})
		.from(schema.questionFollow)
		.where(eq(schema.questionFollow.questionId, questionId));

	return {
		followers: state.followers + 1, // because asker is also follower
		isFollowing: state.isFollowing
	};
}

export function follow(slug: string, userId: string) {
	return db.transaction(async (tx) => {
		const [question] = await tx
			.select({ id: schema.question.id, userId: schema.question.userId })
			.from(schema.question)
			.where(and(eq(schema.question.slug, slug), eq(schema.question.status, 'approved')))
			.limit(1);

		// unknown or not published, which is indistinguishable from the outside on purpose
		if (!question) return { error: 'unknown-question' as const };

		// the asker is mailed anyway, so they never follow their own question
		if (question.userId === userId) return { error: 'own-question' as const };

		const [answered] = await tx
			.select({ id: schema.answer.id })
			.from(schema.answer)
			.where(and(eq(schema.answer.questionId, question.id), eq(schema.answer.status, 'approved')))
			.limit(1);

		// a question is answered once, so there is nothing left to notify about
		if (answered) return { error: 'already-answered' as const };

		await tx
			.insert(schema.questionFollow)
			.values({ id: crypto.randomUUID(), questionId: question.id, userId })
			.onConflictDoNothing();

		return { followed: true as const };
	});
}

export async function unfollow(slug: string, userId: string) {
	const removed = await db
		.delete(schema.questionFollow)
		.where(
			and(
				eq(schema.questionFollow.userId, userId),
				inArray(
					schema.questionFollow.questionId,
					db
						.select({ id: schema.question.id })
						.from(schema.question)
						.where(eq(schema.question.slug, slug))
				)
			)
		)
		.returning({ id: schema.questionFollow.id });

	return removed.length > 0;
}

export async function listForUser(userId: string, isAdmin: boolean) {
	const rows = await db
		.select(cardColumns)
		.from(schema.questionFollow)
		.innerJoin(schema.question, eq(schema.questionFollow.questionId, schema.question.id))
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.leftJoin(schema.answer, latestAnswer(null, isAdmin))
		.where(and(eq(schema.questionFollow.userId, userId), eq(schema.question.status, 'approved')))
		.orderBy(desc(schema.questionFollow.createdAt));

	return nestAnswer(rows);
}
