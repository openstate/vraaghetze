import { beforeEach, describe, expect, test } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';

async function createUser(name: string, overrides: Partial<typeof schema.user.$inferInsert> = {}) {
	const id = crypto.randomUUID();

	const [created] = await db
		.insert(schema.user)
		.values({ id, name, email: `${id}@test.example`, emailVerified: true, ...overrides })
		.returning();

	return created;
}

async function createPolitician() {
	const politicianUser = await createUser('Jan Jansen', { role: 'politician' });

	const fractionId = crypto.randomUUID();
	await db
		.insert(schema.fraction)
		.values({ id: fractionId, slug: `tf-${fractionId}`, name: 'Testfractie', abbreviation: 'TF' });

	const id = crypto.randomUUID();
	await db.insert(schema.politician).values({
		id,
		slug: `jan-jansen-${id}`,
		userId: politicianUser.id,
		fractionId,
		fractionRole: 'member'
	});

	return politicianUser;
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

type LoadData = Exclude<Awaited<ReturnType<typeof page.load>>, void>;

function makeLoadEvent(slug: string, user: typeof schema.user.$inferSelect | null) {
	return {
		params: { slug },
		locals: { user: user ?? undefined },
		url: new URL(`http://localhost/vragen/${slug}`)
	} as unknown as Parameters<typeof page.load>[0];
}

function makeActionEvent(
	slug: string,
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);

	return {
		params: { slug },
		locals: { user: user ?? undefined },
		request: new Request(`http://localhost/vragen/${slug}`, { method: 'POST', body: formData })
	} as unknown as Parameters<typeof page.actions.bevestigen>[0];
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

describe('load', () => {
	test('serves an approved question to an anonymous visitor', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const result = (await page.load(makeLoadEvent(question.slug, null))) as LoadData;

		expect(result.question).toMatchObject({ title: question.title });
	});

	test('hides an invisible question behind the same 404 as a missing one', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const pending = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });

		await expect(page.load(makeLoadEvent(pending.slug, null))).rejects.toMatchObject({
			status: 404
		});
		await expect(page.load(makeLoadEvent('bestaat-niet', null))).rejects.toMatchObject({
			status: 404
		});
	});
});

describe('bevestigen action', () => {
	test('requires a signed-in user', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = makeActionEvent(question.slug, null, { keuze: 'ja' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 401 });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toBeNull();
	});

	test('verifies the question when the owner confirms', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = makeActionEvent(question.slug, asker, { keuze: 'ja' });
		const result = await page.actions.bevestigen(event);

		expect(result).toEqual({ confirmed: true });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).not.toBeNull();
	});

	test('answers someone else than the owner with a 404 without verifying', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const stranger = await createUser('Sjaak Stranger');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = makeActionEvent(question.slug, stranger, { keuze: 'ja' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 404 });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toBeNull();
	});

	test('answers someone else than the owner with a 404 without deleting', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const stranger = await createUser('Sjaak Stranger');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = makeActionEvent(question.slug, stranger, { keuze: 'nee' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 404 });
		expect(await getQuestionBySlug(question.slug)).toBeDefined();
	});

	test('confirms an already verified question again without touching the timestamp', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const verifiedAt = new Date('2026-07-01T12:00:00Z');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt });

		const event = makeActionEvent(question.slug, asker, { keuze: 'ja' });
		const result = await page.actions.bevestigen(event);

		expect(result).toEqual({ confirmed: true });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toEqual(verifiedAt);
	});

	test('deletes the question and redirects when the owner declines', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = makeActionEvent(question.slug, asker, { keuze: 'nee' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 303 });
		expect(await getQuestionBySlug(question.slug)).toBeUndefined();
	});

	test('fails on an invalid choice', async () => {
		const politicianUser = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = makeActionEvent(question.slug, asker, { keuze: 'misschien' });
		const result = await page.actions.bevestigen(event);

		expect(result).toMatchObject({ status: 400 });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toBeNull();
	});
});
