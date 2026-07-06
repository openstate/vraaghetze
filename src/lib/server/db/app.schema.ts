import { relations } from 'drizzle-orm';
import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { account, session, user } from './auth.schema';

// --- TABLES ---

export type FractionRole = 'member' | 'chair';

export const thread = pgTable('thread', {
	id: text().primaryKey(),
	userId: text()
		.references(() => user.id)
		.notNull(),
	title: text().notNull(),
	slug: text().unique().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type PostSource = 'web' | 'email';

export const post = pgTable('post', {
	id: text().primaryKey(),
	threadId: text()
		.references(() => thread.id, { onDelete: 'cascade' })
		.notNull(),
	userId: text()
		.references(() => user.id)
		.notNull(),
	fractionSnapshotId: text().references(() => fraction.id),
	assigneeId: text().references(() => user.id),
	body: text().notNull(),
	status: text().$type<ModerationStatus>().default('pending').notNull(),
	source: text().$type<PostSource>().default('web').notNull(),
	verifiedAt: timestamp(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const moderationAction = pgTable('moderation_action', {
	id: text().primaryKey(),
	moderatorId: text()
		.references(() => user.id)
		.notNull(),
	postId: text()
		.references(() => post.id)
		.notNull(),
	action: text().$type<ModerationStatus>().notNull(),
	rejectionReason: text(),
	rejectionNote: text(),
	createdAt: timestamp().defaultNow().notNull()
});

export const politician = pgTable('politician', {
	id: text().primaryKey(),
	slug: text().unique().notNull(),
	userId: text()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	isActive: boolean().default(true).notNull(),
	fractionId: text()
		.references(() => fraction.id)
		.notNull(),
	fractionRole: text().$type<FractionRole>().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const fraction = pgTable('fraction', {
	id: text().primaryKey(),
	name: text().notNull(),
	abbreviation: text(),
	isActive: boolean().default(true).notNull()
});

// --- RELATIONS ---

export const fractionRelations = relations(fraction, ({ many }) => ({
	politicians: many(politician),
	posts: many(post)
}));

export const politicianProfileRelations = relations(politician, ({ one }) => ({
	user: one(user, {
		fields: [politician.userId],
		references: [user.id]
	}),
	fraction: one(fraction, {
		fields: [politician.fractionId],
		references: [fraction.id]
	})
}));

export const threadRelations = relations(thread, ({ one, many }) => ({
	user: one(user, {
		fields: [thread.userId],
		references: [user.id]
	}),
	posts: many(post)
}));

export const postRelations = relations(post, ({ one, many }) => ({
	thread: one(thread, {
		fields: [post.threadId],
		references: [thread.id]
	}),
	user: one(user, {
		fields: [post.userId],
		references: [user.id]
	}),
	fraction: one(fraction, {
		fields: [post.fractionSnapshotId],
		references: [fraction.id]
	}),
	assignee: one(user, {
		fields: [post.assigneeId],
		references: [user.id],
		relationName: 'assignedPosts'
	}),
	moderationActions: many(moderationAction)
}));

export const moderationActionRelations = relations(moderationAction, ({ one }) => ({
	post: one(post, {
		fields: [moderationAction.postId],
		references: [post.id]
	}),
	moderator: one(user, {
		fields: [moderationAction.moderatorId],
		references: [user.id]
	})
}));

// This object overrides the automatically generated one in auth.schema.ts,
// so that we can add our application specific relations to it. Drizzle is working
// on a `defineRelationsPart` API, this is in beta as of 2026-04-15. I am waiting
// on better-auth to update to the new API before I can clean this up. See:
// https://github.com/better-auth/better-auth/pull/9489
export const userRelations = relations(user, ({ one, many }) => ({
	sessions: many(session),
	accounts: many(account),
	politicianProfile: one(politician, {
		fields: [user.id],
		references: [politician.userId]
	}),
	threads: many(thread),
	posts: many(post),
	assignedPosts: many(post, { relationName: 'assignedPosts' }),
	moderationActions: many(moderationAction)
}));
