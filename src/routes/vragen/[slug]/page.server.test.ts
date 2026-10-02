import { beforeEach, describe, expect, test, vi } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';
import { createModerationAction, createPolitician, createUser, getQuestionAudit, getQuestionBySlug, makeActionEvent } from '$lib/test-utils';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

const enqueueMail = vi.hoisted(() => vi.fn());
enqueueMail.mockReturnValue(crypto.randomUUID());
vi.mock(import('$lib/server/email/outbox'), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		enqueueMail
	};
});

const sendSignInLink = vi.hoisted(() => vi.fn());
vi.mock(import('$lib/server/auth'), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		sendSignInLink
	};
});

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

type LoadData = Exclude<Awaited<ReturnType<typeof page.load>>, void>;

function makeLoadEvent(
	slug: string,
	user: typeof schema.user.$inferSelect | null,
	search: string = ''
) {
	return {
		params: { slug },
		locals: { user: user ?? undefined },
		url: new URL(`http://localhost/vragen/${slug}${search}`)
	} as unknown as Parameters<typeof page.load>[0];
}

function myMakeActionEvent(
	slug: string,
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	return makeActionEvent<typeof page.actions.bevestigen>(
		`http://localhost/vragen/${slug}`,
		user,
		fields,
		slug
	);
}

function getFollow(questionId: string, userId: string) {
	return db
		.select()
		.from(schema.questionFollow)
		.where(
			and(
				eq(schema.questionFollow.questionId, questionId),
				eq(schema.questionFollow.userId, userId)
			)
		);
}

beforeEach(async () => {
	sendSignInLink.mockClear();

	await db.transaction(async (tx) => {
		await tx.delete(schema.moderationAction);
		await tx.delete(schema.inbox);
		await tx.delete(schema.answer);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
	});
});

describe('load', () => {
	test('serves an approved question to an anonymous visitor', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const result = (await page.load(makeLoadEvent(question.slug, null))) as LoadData;

		expect(result.question).toMatchObject({ title: question.title });
	});

	test('hides an invisible question from other users', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const stranger = await createUser('Sjaak Stranger');
		const pending = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });

		await expect(page.load(makeLoadEvent(pending.slug, stranger))).rejects.toMatchObject({
			status: 404
		});
	});

	test('hides an invisible question behind the same 404 as a missing one', async () => {
		const { politicianUser } = await createPolitician();
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
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = myMakeActionEvent(question.slug, null, { keuze: 'ja' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 401 });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toBeNull();
	});

	test('verifies the question when the owner confirms', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = myMakeActionEvent(question.slug, asker, { keuze: 'ja' });
		const result = await page.actions.bevestigen(event);

		expect(result).toEqual({ confirmed: true });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).not.toBeNull();
	});

	test('answers someone else than the owner with a 404 without verifying', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const stranger = await createUser('Sjaak Stranger');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = myMakeActionEvent(question.slug, stranger, { keuze: 'ja' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 404 });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toBeNull();
	});

	test('answers someone else than the owner with a 404 without deleting', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const stranger = await createUser('Sjaak Stranger');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = myMakeActionEvent(question.slug, stranger, { keuze: 'nee' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 404 });
		expect(await getQuestionBySlug(question.slug)).toBeDefined();
	});

	test('confirms an already verified question again without touching the timestamp', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const verifiedAt = new Date('2026-07-01T12:00:00Z');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt });

		const event = myMakeActionEvent(question.slug, asker, { keuze: 'ja' });
		const result = await page.actions.bevestigen(event);

		expect(result).toEqual({ confirmed: true });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toEqual(verifiedAt);
	});

	test('deletes the question and redirects when the owner declines', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = myMakeActionEvent(question.slug, asker, { keuze: 'nee' });

		await expect(page.actions.bevestigen(event)).rejects.toMatchObject({ status: 303 });
		expect(await getQuestionBySlug(question.slug)).toBeUndefined();
	});

	test('fails on an invalid choice', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { verifiedAt: null });

		const event = myMakeActionEvent(question.slug, asker, { keuze: 'misschien' });
		const result = await page.actions.bevestigen(event);

		expect(result).toMatchObject({ status: 400 });
		expect((await getQuestionBySlug(question.slug)).verifiedAt).toBeNull();
	});
});

describe('volgen action', () => {
	test('follows the question for a signed-in visitor', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const result = await page.actions.volgen(myMakeActionEvent(question.slug, follower));

		expect(result).toEqual({ followed: true });
		expect(await getFollow(question.id, follower.id)).toHaveLength(1);

		const loaded = (await page.load(makeLoadEvent(question.slug, follower))) as LoadData;
		expect(loaded).toMatchObject({ followers: 2, isFollowing: true });
	});

	// the refusals themselves are follows.follow()'s, so this only pins the 400 they become
	test('answers a refused follow with a 400', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const result = await page.actions.volgen(myMakeActionEvent(question.slug, asker));

		expect(result).toMatchObject({ status: 400 });
		expect(await getFollow(question.id, asker.id)).toHaveLength(0);
	});

	test('requires a signed-in user', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const event = myMakeActionEvent(question.slug, null, { email: 'fatima@test.example' });

		await expect(page.actions.ontvolgen(event)).rejects.toMatchObject({ status: 401 });
		expect(sendSignInLink).not.toHaveBeenCalled();
	});
});

describe('ontvolgen action', () => {
	test('requires a signed-in user', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const event = myMakeActionEvent(question.slug, null);

		await expect(page.actions.ontvolgen(event)).rejects.toMatchObject({ status: 401 });
	});
});

describe('follow banner', () => {
	test('asks for a press on the bell after arriving from the follow mail', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const event = makeLoadEvent(question.slug, follower, '?doel=volgen');
		expect(((await page.load(event)) as LoadData).banner).toBe('follow');

		await page.actions.volgen(myMakeActionEvent(question.slug, follower));

		expect(((await page.load(event)) as LoadData).banner).toBeNull();
	});
});

describe('kamerlid_wijzigen action', () => {
	test('requires a signed-in user', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { politicianUser } = await createPolitician();
		const { politician: proposedPolitician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });
		await createModerationAction('pending-wrong-politician', moderator, question, { meta: {proposedPoliticianSlug: proposedPolitician.slug} });

		const event = myMakeActionEvent(question.slug, null, { keuze: 'ja' });

		await expect(page.actions.kamerlid_wijzigen(event)).rejects.toMatchObject({ status: 401 });
		expect((await getQuestionBySlug(question.slug)).status).toBe('pending-wrong-politician')
	});

	test('approves the question when the owner confirms', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { politician, politicianUser } = await createPolitician();
		const { politician: proposedPolitician, politicianUser: proposedPoliticianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		let question = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });
		await createModerationAction('pending-wrong-politician', moderator, question, { meta: {proposedPoliticianSlug: proposedPolitician.slug} });

		const event = myMakeActionEvent(question.slug, asker, { keuze: 'ja' });
		const result = await page.actions.kamerlid_wijzigen(event);

		expect(result).toEqual({ politician_changed: true });
		question = await getQuestionBySlug(question.slug);
		expect(question.status).toBe('approved')
		expect(question.assigneeId).toBe(proposedPoliticianUser.id)

		const lastModerationAction = await getQuestionAudit(question.id);
		expect(lastModerationAction.action).toBe('approved');
		expect(lastModerationAction.moderatorId).toBe(moderator.id);
		expect(lastModerationAction.note).toBe('Geautomatiseerde notitie: deze vraag werd automatisch goedgekeurd na bevestiging door vrager om Kamerlid aan te passen.');
		expect(lastModerationAction.meta).toBeNull();

		const lastButOneModerationAction = await getQuestionAudit(question.id, 1);
		expect(lastButOneModerationAction.action).toBe('politician-changed');
		expect(lastButOneModerationAction.moderatorId).toBe(moderator.id);
		expect(lastButOneModerationAction.note).toBe(`Geautomatiseerde notitie: na bevestiging door vrager Kamerlid aangepast van ${politician.slug} naar ${proposedPolitician.slug}.`);
		expect(lastButOneModerationAction.meta).toMatchObject({currentSlug: politician.slug, newSlug: proposedPolitician.slug});
	});

	test('answers someone else than the owner with a 404 without verifying', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { politicianUser } = await createPolitician();
		const { politician: proposedPolitician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const stranger = await createUser('Sjaak Stranger');
		const question = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });
		await createModerationAction('pending-wrong-politician', moderator, question, { meta: {proposedPoliticianSlug: proposedPolitician.slug} });

		const event = myMakeActionEvent(question.slug, stranger, { keuze: 'ja' });

		await expect(page.actions.kamerlid_wijzigen(event)).rejects.toMatchObject({ status: 404 });
		expect((await getQuestionBySlug(question.slug)).status).toBe('pending-wrong-politician')
	});

	test('checks that new politician accepts answers', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { politicianUser } = await createPolitician();
		const { politician: proposedPolitician } = await createPolitician('Jan Jansen', { acceptsQuestions: false });
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });
		await createModerationAction('pending-wrong-politician', moderator, question, { meta: {proposedPoliticianSlug: proposedPolitician.slug} });

		const event = myMakeActionEvent(question.slug, asker, { keuze: 'ja' });

		const result = await page.actions.kamerlid_wijzigen(event);

		expect(result).toMatchObject({ status: 400, data: {error: 'Dit Kamerlid heeft ervoor gekozen niet openbaar antwoord te geven via VraagHetZe.'} });
		expect((await getQuestionBySlug(question.slug)).status).toBe('pending-wrong-politician')
	});

	test('rejects the question when the owner does not confirm', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { politician, politicianUser } = await createPolitician();
		const { politician: proposedPolitician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		let question = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });
		await createModerationAction('pending-wrong-politician', moderator, question, { meta: {proposedPoliticianSlug: proposedPolitician.slug} });

		const event = myMakeActionEvent(question.slug, asker, { keuze: 'nee' });
		const result = await page.actions.kamerlid_wijzigen(event);

		expect(result).toEqual({ politician_changed: false });
		question = await getQuestionBySlug(question.slug);
		expect(question.status).toBe('rejected')
		expect(question.assigneeId).toBe(politicianUser.id)

		const lastModerationAction = await getQuestionAudit(question.id);
		expect(lastModerationAction.action).toBe('rejected');
		expect(lastModerationAction.moderatorId).toBe(moderator.id);
		expect(lastModerationAction.note).toBe('Geautomatiseerde notitie: deze vraag werd automatisch afgekeurd na bevestiging door vrager om Kamerlid niet aan te passen.');
		expect(lastModerationAction.meta).toMatchObject({currentSlug: politician.slug, newSlug: proposedPolitician.slug});
	});
});