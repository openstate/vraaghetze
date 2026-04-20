import { relations } from 'drizzle-orm';
import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { account, session, user } from './auth.schema';

// --- TABLES ---

export const thread = pgTable('thread', {
	id: text().primaryKey(),
	userId: text()
		.notNull()
		.references(() => user.id),
	title: text().notNull(),
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
		.notNull()
		.references(() => thread.id, { onDelete: 'cascade' }),
	userId: text()
		.notNull()
		.references(() => user.id),
	assigneeId: text().references(() => user.id),
	body: text().notNull(),
	status: text().$type<ModerationStatus>().default('pending').notNull(),
	source: text().$type<PostSource>().default('web').notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const moderationAction = pgTable('moderation_action', {
	id: text().primaryKey(),
	moderatorId: text()
		.notNull()
		.references(() => user.id),
	postId: text()
		.notNull()
		.references(() => post.id),
	action: text().$type<ModerationStatus>().notNull(),
	rejectionReason: text(),
	rejectionNote: text(),
	createdAt: timestamp().defaultNow().notNull()
});

export const politicianProfile = pgTable('politician_profile', {
	userId: text()
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	externalId: text().notNull().unique(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export type FractionRole = 'member' | 'chair';

export const politicianFraction = pgTable('politician_fraction', {
	id: text().primaryKey(),
	politicianUserId: text()
		.notNull()
		.references(() => politicianProfile.userId, { onDelete: 'cascade' }),
	externalId: text().unique(),
	name: text().notNull(),
	abbreviation: text(),
	role: text().$type<FractionRole>().default('member').notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	endedAt: timestamp()
});

// --- RELATIONS ---

export const politicianProfileRelations = relations(politicianProfile, ({ one, many }) => ({
	user: one(user, {
		fields: [politicianProfile.userId],
		references: [user.id]
	}),
	fractionMemberships: many(politicianFraction)
}));

export const politicianFractionRelations = relations(politicianFraction, ({ one }) => ({
	politician: one(politicianProfile, {
		fields: [politicianFraction.politicianUserId],
		references: [politicianProfile.userId]
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
// on a `defineRelationsPart` API, this is in beta as of 2026-04-15.
export const userRelations = relations(user, ({ one, many }) => ({
	sessions: many(session),
	accounts: many(account),
	politicianProfile: one(politicianProfile, {
		fields: [user.id],
		references: [politicianProfile.userId]
	}),
	threads: many(thread),
	posts: many(post),
	assignedPosts: many(post, { relationName: 'assignedPosts' }),
	moderationActions: many(moderationAction)
}));
