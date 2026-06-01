import { and, asc, desc, eq, isNotNull, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, schema } from '$lib/server/db';
import { slugify } from '$lib/server/slug';

const RESERVED_SLUGS = ['stellen'];

export function list(viewerId: string | null) {
	const politicianUser = alias(schema.user, 'politicianUser');

	return (
		db
			.select({
				slug: schema.thread.slug,
				title: schema.thread.title,
				createdAt: schema.thread.createdAt,
				status: schema.post.status,
				authorName: schema.user.name,
				politicianName: politicianUser.name,
				politicianSlug: schema.politician.slug,
				fraction: schema.fraction.abbreviation,
				fractionName: schema.fraction.name
			})
			.from(schema.thread)
			.innerJoin(schema.user, eq(schema.thread.userId, schema.user.id))
			.innerJoin(
				schema.post,
				and(eq(schema.post.threadId, schema.thread.id), isNotNull(schema.post.assigneeId))
			)
			.innerJoin(politicianUser, eq(schema.post.assigneeId, politicianUser.id))
			.innerJoin(schema.politician, eq(schema.post.assigneeId, schema.politician.userId))
			.leftJoin(schema.fraction, eq(schema.post.fractionSnapshotId, schema.fraction.id))
			// Public sees approved questions; a signed-in user also sees their own still-pending
			// ones, so a question they just asked doesn't vanish from the lists.
			.where(
				or(
					eq(schema.post.status, 'approved'),
					viewerId
						? and(eq(schema.thread.userId, viewerId), eq(schema.post.status, 'pending'))
						: undefined
				)
			)
			.orderBy(desc(schema.thread.createdAt))
	);
}

export function listForPolitician(slug: string, viewerId: string | null) {
	return (
		db
			.selectDistinct({
				slug: schema.thread.slug,
				title: schema.thread.title,
				createdAt: schema.thread.createdAt,
				status: schema.post.status
			})
			.from(schema.thread)
			.innerJoin(schema.post, eq(schema.post.threadId, schema.thread.id))
			.innerJoin(schema.politician, eq(schema.post.assigneeId, schema.politician.userId))
			// Approved questions for everyone; a signed-in user also sees their own pending ones.
			.where(
				and(
					eq(schema.politician.slug, slug),
					or(
						eq(schema.post.status, 'approved'),
						viewerId
							? and(eq(schema.thread.userId, viewerId), eq(schema.post.status, 'pending'))
							: undefined
					)
				)
			)
			.orderBy(desc(schema.thread.createdAt))
	);
}

export function listForUser(userId: string) {
	const politicianUser = alias(schema.user, 'politicianUser');

	return db
		.select({
			slug: schema.thread.slug,
			title: schema.thread.title,
			createdAt: schema.thread.createdAt,
			status: schema.post.status,
			politicianName: politicianUser.name,
			politicianSlug: schema.politician.slug,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.thread)
		.innerJoin(
			schema.post,
			and(eq(schema.post.threadId, schema.thread.id), isNotNull(schema.post.assigneeId))
		)
		.innerJoin(politicianUser, eq(schema.post.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.post.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.post.fractionSnapshotId, schema.fraction.id))
		.where(eq(schema.thread.userId, userId))
		.orderBy(desc(schema.thread.createdAt));
}

export async function bySlug(slug: string, viewerId: string | null) {
	const [thread] = await db
		.select({
			id: schema.thread.id,
			title: schema.thread.title,
			createdAt: schema.thread.createdAt,
			authorName: schema.user.name
		})
		.from(schema.thread)
		.innerJoin(schema.user, eq(schema.thread.userId, schema.user.id))
		.where(eq(schema.thread.slug, slug))
		.limit(1);

	if (!thread) return null;

	const assignee = alias(schema.user, 'assignee');

	const posts = await db
		.select({
			id: schema.post.id,
			body: schema.post.body,
			status: schema.post.status,
			source: schema.post.source,
			createdAt: schema.post.createdAt,
			authorName: schema.user.name,
			assigneeName: assignee.name,
			assigneeSlug: schema.politician.slug,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.post)
		.innerJoin(schema.user, eq(schema.post.userId, schema.user.id))
		.leftJoin(assignee, eq(schema.post.assigneeId, assignee.id))
		.leftJoin(schema.politician, eq(schema.post.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.post.fractionSnapshotId, schema.fraction.id))
		// Approved questions for everyone; a signed-in user also sees their own pending ones.
		.where(
			and(
				eq(schema.post.threadId, thread.id),
				or(
					eq(schema.post.status, 'approved'),
					viewerId ? eq(schema.post.userId, viewerId) : undefined
				)
			)
		)
		.orderBy(asc(schema.post.createdAt));

	if (posts.length === 0) return null;

	return { thread, posts };
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
		const [politician] = await tx
			.select({
				userId: schema.politician.userId,
				fractionId: schema.politician.fractionId
			})
			.from(schema.politician)
			.where(and(eq(schema.politician.id, politicianId), eq(schema.politician.isActive, true)))
			.limit(1);

		if (!politician) return null;

		let askerId: string;
		if (currentUserId) {
			askerId = currentUserId;
		} else {
			const [existing] = await tx
				.select({ id: schema.user.id })
				.from(schema.user)
				.where(eq(schema.user.email, email))
				.limit(1);

			if (existing) {
				askerId = existing.id;
			} else {
				askerId = crypto.randomUUID();
				await tx.insert(schema.user).values({ id: askerId, name, email });
			}
		}

		const base = slugify(title) || 'vraag';
		const taken = await tx
			.select({ slug: schema.thread.slug })
			.from(schema.thread)
			.where(or(eq(schema.thread.slug, base), sql`${schema.thread.slug} ~ ${`^${base}-[0-9]+$`}`));
		const used = new Set([...RESERVED_SLUGS, ...taken.map((row) => row.slug)]);
		let candidate = base;
		for (let suffix = 2; used.has(candidate); suffix++) candidate = `${base}-${suffix}`;

		const threadId = crypto.randomUUID();
		await tx
			.insert(schema.thread)
			.values({ id: threadId, userId: askerId, title, slug: candidate });
		await tx.insert(schema.post).values({
			id: crypto.randomUUID(),
			threadId,
			userId: askerId,
			assigneeId: politician.userId,
			fractionSnapshotId: politician.fractionId,
			body
		});

		return candidate;
	});
}
