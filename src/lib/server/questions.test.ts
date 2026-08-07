import { beforeEach, describe, expect, test } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as questions from './questions';

async function createUser(name: string, overrides: Partial<typeof schema.user.$inferInsert> = {}) {
	const id = crypto.randomUUID();

	const [created] = await db
		.insert(schema.user)
		.values({ id, name, email: `${id}@test.example`, emailVerified: true, ...overrides })
		.returning();

	return created;
}

async function createPolitician(overrides: Partial<typeof schema.politician.$inferInsert> = {}) {
	const politicianUser = await createUser('Jan Jansen', { role: 'politician' });

	const fractionId = crypto.randomUUID();
	await db
		.insert(schema.fraction)
		.values({ id: fractionId, slug: `tf-${fractionId}`, name: 'Testfractie', abbreviation: 'TF' });

	const id = crypto.randomUUID();
	const [politician] = await db
		.insert(schema.politician)
		.values({
			id,
			slug: `jan-jansen-${id}`,
			userId: politicianUser.id,
			fractionId,
			fractionRole: 'member',
			...overrides
		})
		.returning();

	return { politician, politicianUser };
}

async function insertQuestion(
	askerId: string,
	assigneeId: string,
	overrides: Partial<typeof schema.question.$inferInsert> = {}
) {
	const id = crypto.randomUUID();

	const [question] = await db
		.insert(schema.question)
		.values({
			id,
			userId: askerId,
			assigneeId,
			title: 'Wat vindt u van de toeslagen?',
			body: 'Graag een toelichting.',
			slug: `testvraag-${id}`,
			status: 'approved',
			verifiedAt: new Date(),
			...overrides
		})
		.returning();

	return question;
}

async function getQuestionBySlug(slug: string) {
	const [question] = await db.select().from(schema.question).where(eq(schema.question.slug, slug));
	return question;
}

beforeEach(async () => {
	await db.transaction(async (tx) => {
		await tx.delete(schema.moderationAction);
		await tx.delete(schema.inbox);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
	});
});

describe('create', () => {
	const questionInput = {
		name: 'Vera Vraagsteller',
		email: 'vera@test.example',
		title: 'Wat vindt u van de toeslagen?',
		body: 'Graag een toelichting.'
	} as const;

	test('creates an immediately verified question for a signed-in asker', async () => {
		const { politician, politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');

		const result = await questions.create({
			...questionInput,
			politicianId: politician.id,
			currentUserId: asker.id
		});

		expect(result).toEqual({ slug: 'wat-vindt-u-van-de-toeslagen' });
		const question = await getQuestionBySlug('wat-vindt-u-van-de-toeslagen');
		expect(question).toMatchObject({
			userId: asker.id,
			assigneeId: politicianUser.id,
			assigneeFractionId: politician.fractionId,
			status: 'pending'
		});
		expect(question.verifiedAt).not.toBeNull();
	});

	test('rejects a question addressed to an inactive politician', async () => {
		const { politician } = await createPolitician({ isActive: false });
		const asker = await createUser('Vera Vraagsteller');

		const result = await questions.create({
			...questionInput,
			politicianId: politician.id,
			currentUserId: asker.id
		});

		expect(result).toEqual({ error: 'unknown-politician' });
		expect(await db.select().from(schema.question)).toHaveLength(0);
	});

	test('creates a new user and an unverified question for an unknown email', async () => {
		const { politician } = await createPolitician();
		const email = `nieuw-${crypto.randomUUID()}@test.example`;

		const result = await questions.create({
			...questionInput,
			email,
			politicianId: politician.id,
			currentUserId: null
		});

		expect(result).toEqual({ slug: 'wat-vindt-u-van-de-toeslagen' });
		const [createdUser] = await db.select().from(schema.user).where(eq(schema.user.email, email));
		expect(createdUser).toMatchObject({ name: 'Vera Vraagsteller', emailVerified: false });
		const question = await getQuestionBySlug('wat-vindt-u-van-de-toeslagen');
		expect(question.userId).toBe(createdUser.id);
		expect(question.verifiedAt).toBeNull();
		expect(question.status).toBe('pending');
	});

	test('links the question to an existing user with the same email', async () => {
		const { politician } = await createPolitician();
		const existing = await createUser('Bestaande Gebruiker');

		const result = await questions.create({
			...questionInput,
			email: existing.email,
			politicianId: politician.id,
			currentUserId: null
		});

		expect(result).toEqual({ slug: 'wat-vindt-u-van-de-toeslagen' });
		const question = await getQuestionBySlug('wat-vindt-u-van-de-toeslagen');
		expect(question.userId).toBe(existing.id);
		const usersForEmail = await db
			.select()
			.from(schema.user)
			.where(eq(schema.user.email, existing.email));
		expect(usersForEmail).toHaveLength(1);
		expect(usersForEmail[0].name).toBe('Bestaande Gebruiker');
	});

	test('refuses an email belonging to a politician', async () => {
		const { politician, politicianUser } = await createPolitician();

		const result = await questions.create({
			...questionInput,
			email: politicianUser.email,
			politicianId: politician.id,
			currentUserId: null
		});

		expect(result).toEqual({ error: 'forbidden-asker' });
		expect(await db.select().from(schema.question)).toHaveLength(0);
	});

	test('deduplicates slugs with a numeric suffix', async () => {
		const { politician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const input = { ...questionInput, politicianId: politician.id, currentUserId: asker.id };

		const first = await questions.create(input);
		const second = await questions.create(input);
		const third = await questions.create(input);

		expect(first).toEqual({ slug: 'wat-vindt-u-van-de-toeslagen' });
		expect(second).toEqual({ slug: 'wat-vindt-u-van-de-toeslagen-2' });
		expect(third).toEqual({ slug: 'wat-vindt-u-van-de-toeslagen-3' });
	});

	test('never hands out a reserved slug', async () => {
		const { politician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');

		const result = await questions.create({
			...questionInput,
			title: 'Stellen',
			politicianId: politician.id,
			currentUserId: asker.id
		});

		expect(result).toEqual({ slug: 'stellen-2' });
	});
});

describe('visibility', () => {
	test('listForPolitician hides pending questions', async () => {
		const { politician, politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const approved = await insertQuestion(asker.id, politicianUser.id);
		await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });

		const list = await questions.listForPolitician(politician.slug, 10);

		expect(list.map((row) => row.slug)).toEqual([approved.slug]);
	});

	test('bySlug hides an invisible question exactly like a missing one', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const pending = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });

		expect(await questions.bySlug(pending.slug, null)).toBeNull();
		expect(await questions.bySlug('bestaat-niet', null)).toBeNull();

		const ownerResult = await questions.bySlug(pending.slug, asker.id);
		expect(ownerResult?.question).toMatchObject({ title: pending.title, status: 'pending' });
	});

	test('bySlug hides a pending answer from everyone but its author', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await db.insert(schema.answer).values({
			id: crypto.randomUUID(),
			questionId: question.id,
			userId: politicianUser.id,
			body: 'Mijn antwoord.',
			status: 'pending'
		});

		const publicResult = await questions.bySlug(question.slug, null);
		const authorResult = await questions.bySlug(question.slug, politicianUser.id);

		expect(publicResult?.answer).toBeNull();
		expect(authorResult?.answer).toMatchObject({ body: 'Mijn antwoord.', status: 'pending' });
	});
});

describe('question ownership', () => {
	test('pendingConfirmation reports the verification state only to the owner', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const unverified = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });
		const verified = await insertQuestion(asker.id, politicianUser.id);

		expect(await questions.pendingConfirmation(unverified.slug, asker.id)).toBe(true);
		expect(await questions.pendingConfirmation(verified.slug, asker.id)).toBe(false);
		expect(await questions.pendingConfirmation(unverified.slug, politicianUser.id)).toBeNull();
	});

	test('claimQuestion verifies only the owner’s unverified question', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		await questions.claimQuestion(question.slug, politicianUser.id);
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toBeNull();

		await questions.claimQuestion(question.slug, asker.id);
		expect((await getQuestionBySlug(question.slug)).verifiedAt).not.toBeNull();
	});

	test('disownQuestion deletes only the owner’s unverified question', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const unverified = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });
		const verified = await insertQuestion(asker.id, politicianUser.id);

		await questions.disownQuestion(unverified.slug, politicianUser.id);
		expect(await getQuestionBySlug(unverified.slug)).toBeDefined();

		await questions.disownQuestion(unverified.slug, asker.id);
		await questions.disownQuestion(verified.slug, asker.id);
		expect(await getQuestionBySlug(unverified.slug)).toBeUndefined();
		expect(await getQuestionBySlug(verified.slug)).toBeDefined();
	});
});
