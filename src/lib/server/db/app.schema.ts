import { relations, sql } from 'drizzle-orm';
import {
	pgTable,
	text,
	boolean,
	timestamp,
	integer,
	jsonb,
	check,
	customType,
	index
} from 'drizzle-orm/pg-core';
import { account, session, user } from './auth.schema';
import type { InboundEmail } from '../email/parse-inbound';

// --- TABLES ---

// postgres full-text search vector
const tsvector = customType<{ data: string; driverData: string }>({ dataType: () => 'tsvector' });

export type FractionRole = 'member' | 'chair';

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

const postColumns = {
	id: text().primaryKey(),
	userId: text()
		.references(() => user.id)
		.notNull(),
	body: text().notNull(),
	status: text().$type<ModerationStatus>().default('pending').notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
};

export const question = pgTable(
	'question',
	{
		...postColumns,
		title: text().notNull(),
		slug: text().unique().notNull(),
		assigneeId: text()
			.references(() => user.id)
			.notNull(),
		// snapshot of the assignee's fraction, so later party switches don't rewrite history
		assigneeFractionId: text().references(() => fraction.id),
		verifiedAt: timestamp(),
		// routing token for the politician's reply, generated at approval
		emailToken: text().unique(),
		// weighted vector for searching and finding related questions (A/B/C is for weighting)
		searchVector: tsvector()
			.generatedAlwaysAs(
				sql`setweight(to_tsvector('dutch', "title"), 'A') || setweight(to_tsvector('dutch', "body"), 'C')`
			)
			.notNull()
	},
	(table) => [
		index('question_search_idx').using('gin', table.searchVector),
		index('question_created_at_idx').on(table.createdAt)
	]
);

export const answer = pgTable(
	'answer',
	{
		...postColumns,
		questionId: text()
			.references(() => question.id, { onDelete: 'cascade' })
			.notNull(),
		// weighted vector for searching and finding related answers (A/B/C is for weighting)
		searchVector: tsvector()
			.generatedAlwaysAs(sql`setweight(to_tsvector('dutch', "body"), 'B')`)
			.notNull()
	},
	(table) => [
		index('answer_search_idx').using('gin', table.searchVector),
		index('answer_question_id_idx').on(table.questionId)
	]
);

export const moderationAction = pgTable(
	'moderation_action',
	{
		id: text().primaryKey(),
		moderatorId: text()
			.references(() => user.id)
			.notNull(),
		questionId: text().references(() => question.id),
		answerId: text().references(() => answer.id),
		action: text().$type<ModerationStatus>().notNull(),
		// reason sent to the user
		rejectionReason: text(),
		// internal free-text note from the moderator
		note: text(),
		createdAt: timestamp().defaultNow().notNull()
	},
	(table) => [
		// a moderation action targets either a question or an answer, never both
		check(
			'moderation_action_target',
			sql`(${table.questionId} is null) != (${table.answerId} is null)`
		)
	]
);

export type OutboxKind =
	| 'question-notification'
	| 'moderation-notification'
	| 'answer-notification'
	| 'magic-link';

export type OutboxStatus = 'queued' | 'sending' | 'sent' | 'failed';

export const outbox = pgTable(
	'outbox',
	{
		id: text().primaryKey(),
		kind: text().$type<OutboxKind>().notNull(),
		questionId: text().references(() => question.id, { onDelete: 'cascade' }),
		recipient: text().notNull(),
		replyTo: text(),
		subject: text().notNull(),
		body: text().notNull(),
		status: text().$type<OutboxStatus>().default('queued').notNull(),
		attempts: integer().default(0).notNull(),
		lastError: text(),
		expiresAt: timestamp(),
		nextAttemptAt: timestamp().defaultNow().notNull(),
		sentAt: timestamp(),
		createdAt: timestamp().defaultNow().notNull()
	},
	(table) => [index('outbox_sweep_idx').on(table.status, table.nextAttemptAt)]
);

export type InboxStatus = 'received' | 'processed' | 'ignored' | 'failed';

export const inbox = pgTable('inbox', {
	id: text().primaryKey(),
	dedupKey: text().unique(),
	fromAddress: text().notNull(),
	token: text(),
	subject: text(),
	dkimVerified: boolean().default(false).notNull(),
	payload: jsonb().$type<InboundEmail>().notNull(),
	status: text().$type<InboxStatus>().default('received').notNull(),
	reason: text(),
	answerId: text().references(() => answer.id),
	receivedAt: timestamp().defaultNow().notNull(),
	processedAt: timestamp()
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
	questions: many(question)
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

export const questionRelations = relations(question, ({ one, many }) => ({
	answer: one(answer),
	user: one(user, {
		fields: [question.userId],
		references: [user.id]
	}),
	fraction: one(fraction, {
		fields: [question.assigneeFractionId],
		references: [fraction.id]
	}),
	assignee: one(user, {
		fields: [question.assigneeId],
		references: [user.id],
		relationName: 'assignedQuestions'
	}),
	moderationActions: many(moderationAction),
	outboxMails: many(outbox)
}));

export const outboxRelations = relations(outbox, ({ one }) => ({
	question: one(question, {
		fields: [outbox.questionId],
		references: [question.id]
	})
}));

export const inboxRelations = relations(inbox, ({ one }) => ({
	answer: one(answer, {
		fields: [inbox.answerId],
		references: [answer.id]
	})
}));

export const answerRelations = relations(answer, ({ one, many }) => ({
	question: one(question, {
		fields: [answer.questionId],
		references: [question.id]
	}),
	user: one(user, {
		fields: [answer.userId],
		references: [user.id]
	}),
	moderationActions: many(moderationAction)
}));

export const moderationActionRelations = relations(moderationAction, ({ one }) => ({
	question: one(question, {
		fields: [moderationAction.questionId],
		references: [question.id]
	}),
	answer: one(answer, {
		fields: [moderationAction.answerId],
		references: [answer.id]
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
	questions: many(question),
	answers: many(answer),
	assignedQuestions: many(question, { relationName: 'assignedQuestions' }),
	moderationActions: many(moderationAction)
}));
