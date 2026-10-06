import { eq, desc, count, and, inArray, isNotNull } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import { MAGIC_LINK_EXPIRY } from './server/auth';
import * as InloggenPage from '$routes/inloggen/+page.server';
import * as VraagGegevensPage from '$routes/vragen/stellen/gegevens/+page.server';
import type { ModerationAction } from './server/db/app.schema';
import { getStatus } from './server/questions';
import { actionToStatus } from './server/moderation';
import { createAnswer, createQuestion } from '$e2e/test-utils';

export async function createUser(
	name: string,
	overrides: Partial<typeof schema.user.$inferInsert> = {}
) {
	const id = crypto.randomUUID();

	const [created] = await db
		.insert(schema.user)
		.values({ id, name, email: `${id}@test.example`, emailVerified: true, ...overrides })
		.returning();

	return created;
}

export async function createPolitician(
	name: string = 'Jan Jansen',
	overrides: Partial<typeof schema.politician.$inferInsert> = {}
) {
	const politicianUser = await createUser(name, { role: 'politician' });

	const fractionId = crypto.randomUUID();
	const [fraction] = await db
		.insert(schema.fraction)
		.values({ id: fractionId, slug: `tf-${fractionId}`, name: 'Testfractie', abbreviation: 'TF' })
		.returning();

	const id = crypto.randomUUID();
	const [politician] = await db
		.insert(schema.politician)
		.values({
			id,
			slug: `kamerlid-${id}`,
			userId: politicianUser.id,
			fractionId,
			fractionRole: 'member',
			...overrides
		})
		.returning();

	return { politician, politicianUser, fraction };
}

export async function createQuestionAndUsers(
	overrides: Partial<typeof schema.question.$inferInsert> = {},
	createPolitician: boolean = true
) {
	const asker = await createUser('Vera Vraagsteller');
	const politician = await createUser('Jan Jansen');

	if (createPolitician) {
		const fractionId = crypto.randomUUID();
		await db.insert(schema.fraction).values({
			id: fractionId,
			slug: `tf-${fractionId}`,
			name: 'Testfractie',
			abbreviation: 'TF'
		});

		const politicianId = crypto.randomUUID();
		await db.insert(schema.politician).values({
			id: politicianId,
			slug: `jan-jansen-${politicianId}`,
			userId: politician.id,
			fractionId,
			fractionRole: 'member'
		});
	}

	const question = await createQuestion(asker, politician, overrides);

	return { question, asker, politician };
}

export async function createAnswerAndQuestion(
	overrides: Partial<typeof schema.answer.$inferInsert> = {}
) {
	const { question } = await createQuestionAndUsers({ status: 'approved' });
	const answer = await createAnswer(question, overrides);

	return answer;
}

export async function createSession(
	user_id: string,
	token: string,
	overrides: Partial<typeof schema.session.$inferInsert> = {}
) {
	const [created] = await db
		.insert(schema.session)
		.values({
			id: crypto.randomUUID(),
			expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY),
			token,
			createdAt: new Date(),
			updatedAt: new Date(),
			userId: user_id,
			...overrides
		})
		.returning();

	return created;
}

export async function createVerification(
	token: string,
	email: string,
	overrides: Partial<typeof schema.verification.$inferInsert> = {}
) {
	const [created] = await db
		.insert(schema.verification)
		.values({
			id: crypto.randomUUID(),
			identifier: token,
			value: `{"email":"${email}"}`,
			expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY),
			createdAt: new Date(),
			updatedAt: new Date(),
			...overrides
		})
		.returning();

	return created;
}

export async function createModerationAction(
	action: ModerationAction,
	moderator: { id: string },
	question: typeof schema.question.$inferInsert,
	overrides: Partial<typeof schema.moderationAction.$inferInsert> = {}
) {
	const [created] = await db
		.insert(schema.moderationAction)
		.values({
			id: crypto.randomUUID(),
			questionId: question.id,
			moderatorId: moderator.id,
			action: action,
			createdAt: new Date(),
			...overrides
		})
		.returning();

	// Mimic partly what is done in moderateQuestion
	const currentStatus = await getStatus(question.id);
	const questionStatus = actionToStatus(action, currentStatus);
	await db
		.update(schema.question)
		.set(
			action === 'approved'
				? { status: questionStatus, emailToken: crypto.randomUUID() }
				: { status: questionStatus }
		)
		.where(
			and(
				eq(schema.question.id, question.id),
				inArray(schema.question.status, ['pending', 'pending-wrong-politician']),
				isNotNull(schema.question.verifiedAt)
			)
		);

	return created;
}

export async function getUser(userId: string) {
	const [user] = await db.select().from(schema.user).where(eq(schema.user.id, userId));
	return user;
}

export async function getUserByEmail(email: string) {
	const [user] = await db.select().from(schema.user).where(eq(schema.user.email, email));
	return user;
}

export async function getQuestion(questionId: string) {
	const [question] = await db
		.select()
		.from(schema.question)
		.where(eq(schema.question.id, questionId));
	return question;
}

export async function getQuestionBySlug(slug: string) {
	const [question] = await db.select().from(schema.question).where(eq(schema.question.slug, slug));
	return question;
}

export async function getAnswer(answerId: string) {
	const [answer] = await db.select().from(schema.answer).where(eq(schema.answer.id, answerId));
	return answer;
}

export async function getQuestionAudit(questionId: string, offset: number = 0) {
	const [audit] = await db
		.select()
		.from(schema.moderationAction)
		.where(eq(schema.moderationAction.questionId, questionId))
		.orderBy(desc(schema.moderationAction.createdAt))
		.offset(offset)
		.limit(1);
	return audit;
}

export async function getNumberOfQuestionAudits(questionId: string) {
	const result = await db
		.select({ count: count() })
		.from(schema.moderationAction)
		.where(and(eq(schema.moderationAction.questionId, questionId)));
	return result[0].count;
}

export async function getAnswerAudit(answerId: string) {
	return db
		.select()
		.from(schema.moderationAction)
		.where(eq(schema.moderationAction.answerId, answerId));
}

export async function getVerificationForEmail(email: string) {
	return db
		.select()
		.from(schema.verification)
		.where(eq(schema.verification.value, `{"email":"${email}"}`));
}

export function createCookiesStub(initialCookies = {}) {
	const store = new Map(Object.entries(initialCookies));

	return {
		get: (name: string) => store.get(name),
		getAll: () => Array.from(store.entries()).map(([name, value]) => ({ name, value })),
		set: (name: string, value: string) => {
			store.set(name, String(value));
		},
		delete: (name: string) => {
			store.delete(name);
		}
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeActionEvent<T extends (...args: any) => any>(
	url: string,
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {},
	slug?: string
) {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);

	const result = {
		locals: { user: user ?? undefined },
		url: new URL(url),
		request: new Request(url, { method: 'POST', body: formData }),
		cookies: createCookiesStub()
	} as unknown as Parameters<T>[0];
	if (slug) {
		result.params = { slug };
	}

	return result;
}

export async function statusOf(handlerResult: unknown) {
	const outcome = await Promise.resolve(handlerResult).catch((thrown) => thrown);
	return (outcome as { status?: number } | null)?.status ?? 200;
}

export type registerActionEventOptions = {
	acceptTandC?: string;
	ageChecked?: string;
	setConfirmationEmail?: boolean;
};

export function registerMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {},
	allOptions: registerActionEventOptions = {},
	addCapToken: boolean,
	page: typeof InloggenPage | typeof VraagGegevensPage,
	url: string
) {
	// eslint-disable-next-line prefer-const
	let { setConfirmationEmail, ...options } = allOptions;
	if (typeof setConfirmationEmail === 'undefined') setConfirmationEmail = true;
	if (typeof options.acceptTandC === 'undefined') options.acceptTandC = '1';
	if (typeof options.ageChecked === 'undefined') options.ageChecked = '1';

	fields['emailConfirmation'] = setConfirmationEmail
		? fields['email']
		: `${crypto.randomUUID()}@test.example`;

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	const capField: { capToken: string } | {} = addCapToken ? { capToken: 'a_cap_token' } : {};
	const useFields = {
		...fields,
		...options,
		...capField
	};

	return makeActionEvent<typeof page.actions.default>(url, user, useFields);
}
