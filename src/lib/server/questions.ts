import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, schema, type Transaction } from '$lib/server/db';
import { slugify, slugifyUnique } from '$lib/server/utils/slug';
import { hasPermission } from '$lib/permissions';

const politicianUser = alias(schema.user, 'politicianUser');

// approved rows for everyone, a signed-in user also sees their own regardless of status
const isVisibleTo = (
	table: typeof schema.question | typeof schema.answer,
	viewerId: string | null
) => or(eq(table.status, 'approved'), viewerId ? eq(table.userId, viewerId) : undefined);

export function list(viewerId: string | null) {
	return db
		.select({
			slug: schema.question.slug,
			title: schema.question.title,
			createdAt: schema.question.createdAt,
			status: schema.question.status,
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
		.where(isVisibleTo(schema.question, viewerId))
		.orderBy(desc(schema.question.createdAt));
}

export function listForPolitician(slug: string, viewerId: string | null) {
	return db
		.select({
			slug: schema.question.slug,
			title: schema.question.title,
			createdAt: schema.question.createdAt,
			status: schema.question.status
		})
		.from(schema.question)
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.where(and(eq(schema.politician.slug, slug), isVisibleTo(schema.question, viewerId)))
		.orderBy(desc(schema.question.createdAt));
}

export function listForUser(userId: string) {
	return (
		db
			.select({
				slug: schema.question.slug,
				title: schema.question.title,
				createdAt: schema.question.createdAt,
				status: schema.question.status,
				verifiedAt: schema.question.verifiedAt,
				politicianName: politicianUser.name,
				politicianSlug: schema.politician.slug,
				fraction: schema.fraction.abbreviation,
				fractionName: schema.fraction.name
			})
			.from(schema.question)
			.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
			.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
			.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
			// no status filter: the owner sees all their own questions, verified or not
			.where(eq(schema.question.userId, userId))
			.orderBy(desc(schema.question.createdAt))
	);
}

export async function bySlug(slug: string, viewerId: string | null) {
	const [question] = await db
		.select({
			id: schema.question.id,
			title: schema.question.title,
			body: schema.question.body,
			status: schema.question.status,
			createdAt: schema.question.createdAt,
			authorName: schema.user.name,
			assigneeName: politicianUser.name,
			assigneeSlug: schema.politician.slug,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.where(and(eq(schema.question.slug, slug), isVisibleTo(schema.question, viewerId)))
		.limit(1);

	// the question doesn't exist or the viewer can't see it, which is indistinguishable on purpose
	if (!question) return null;

	const [answer] = await db
		.select({
			id: schema.answer.id,
			body: schema.answer.body,
			status: schema.answer.status,
			createdAt: schema.answer.createdAt,
			authorName: schema.user.name
		})
		.from(schema.answer)
		.innerJoin(schema.user, eq(schema.answer.userId, schema.user.id))
		.where(and(eq(schema.answer.questionId, question.id), isVisibleTo(schema.answer, viewerId)))
		.limit(1);

	return { question, answer: answer ?? null };
}

const reservedSlugs = ['stellen'] as const;

async function slugifyUniqueQuestion(tx: Transaction, title: string) {
	const base = slugify(title) || 'vraag';

	const existing = await tx
		.select({ slug: schema.question.slug })
		.from(schema.question)
		.where(
			or(eq(schema.question.slug, base), sql`${schema.question.slug} ~ ${`^${base}-[0-9]+$`}`)
		);

	const taken = new Set<string>([...reservedSlugs, ...existing.map((row) => row.slug)]);

	return slugifyUnique(base, taken);
}

type CreateQuestion = {
	name: string;
	email: string;
	title: string;
	body: string;
	politicianId: string;
	currentUserId: string | null;
};

export function create({ name, email, title, body, politicianId, currentUserId }: CreateQuestion) {
	return db.transaction(async (tx) => {
		// questions can only be addressed to currently active politicians
		const [politician] = await tx
			.select({ userId: schema.politician.userId, fractionId: schema.politician.fractionId })
			.from(schema.politician)
			.where(and(eq(schema.politician.id, politicianId), eq(schema.politician.isActive, true)))
			.limit(1);

		if (!politician) return { error: 'unknown-politician' as const };

		let userId = currentUserId;

		// non-signed-in asker: find *or* create a user by email
		if (!userId) {
			const [existing] = await tx
				.select({ id: schema.user.id, role: schema.user.role })
				.from(schema.user)
				.where(eq(schema.user.email, email))
				.limit(1);

			if (!hasPermission(existing, { question: ['ask'] })) {
				// user exists for email but is not allowed to ask questions, so error
				return { error: 'forbidden-asker' as const };
			} else if (existing) {
				// user exists for email and is allowed to ask questions, so link unverified question to that user
				userId = existing.id;
			} else {
				// user doesn't exist for email, so create a new user
				userId = crypto.randomUUID();
				await tx.insert(schema.user).values({ id: userId, name, email });
			}
		}

		const slug = await slugifyUniqueQuestion(tx, title);

		await tx.insert(schema.question).values({
			id: crypto.randomUUID(),
			userId,
			title,
			slug,
			assigneeId: politician.userId,
			assigneeFractionId: politician.fractionId,
			body,
			// signed-in askers are verified immediately, otherwise we need to confirm authorship via e-mail link
			verifiedAt: currentUserId ? new Date() : null
		});

		return { slug };
	});
}

export async function pendingConfirmation(slug: string, userId: string) {
	const [question] = await db
		.select({ verifiedAt: schema.question.verifiedAt })
		.from(schema.question)
		.where(and(eq(schema.question.slug, slug), eq(schema.question.userId, userId)))
		.limit(1);

	if (!question) return null; // not the owner / no such question

	return question.verifiedAt === null;
}

export function claimQuestion(slug: string, userId: string) {
	return db
		.update(schema.question)
		.set({ verifiedAt: new Date() })
		.where(
			and(
				eq(schema.question.slug, slug),
				eq(schema.question.userId, userId),
				isNull(schema.question.verifiedAt)
			)
		);
}

export function disownQuestion(slug: string, userId: string) {
	return db
		.delete(schema.question)
		.where(
			and(
				eq(schema.question.slug, slug),
				eq(schema.question.userId, userId),
				isNull(schema.question.verifiedAt)
			)
		);
}
