import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db, schema } from '$lib/server/db';
import { QUESTION_TITLE_MAX_LENGTH } from '$lib/ask';
import * as page from './+page.server';
import { createPolitician, createUser, getQuestionBySlug, getUserByEmail, makeActionEvent } from '$lib/test-utils';
import { userExists } from '$lib/server/auth';

const sendSignInLink = vi.hoisted(() => vi.fn());
vi.mock(import('$lib/server/auth'), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		sendSignInLink
	}
});

// For the tests in this file the validation of the captcha is mocked.
// For tests that actually validate the captcha, see page.server.captcha.test.ts.
const validateCaptcha = vi.hoisted(() => (() => Promise.resolve(true)));
vi.mock('$lib/server/utils/captcha', () => ({ validateCaptcha }));

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
type Chosen = { id: string; slug: string } | null;

function makeLoadEvent(politician: Chosen, search = '') {
	return {
		parent: async () => ({ politician }),
		url: new URL(`http://localhost/vragen/stellen/controle${search}`)
	} as unknown as Parameters<typeof page.load>[0];
}

function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	return makeActionEvent<typeof page.actions.default>(
		`http://localhost/vragen/stellen/controle`,
		user,
		fields
	);
}

const questionFields = {
	name: 'Vera Vraagsteller',
	title: 'Wat vindt u van de toeslagen?',
	body: 'Graag een toelichting.'
} as const;

beforeEach(async () => {
	sendSignInLink.mockClear();

	await db.transaction(async (tx) => {
		await tx.delete(schema.moderationAction);
		await tx.delete(schema.inbox);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
	});
});

describe('load', () => {
	test('shows what the fraction was already asked', async () => {
		const { politician, politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const published = await insertQuestion(asker.id, politicianUser.id, {
			assigneeFractionId: politician.fractionId
		});
		await insertQuestion(asker.id, politicianUser.id, {
			title: 'Hoe staat het met de dijkverzwaring?',
			assigneeFractionId: politician.fractionId
		});

		const event = makeLoadEvent(politician, '?aan=jan-jansen&vraag=toeslagen');
		const data = (await page.load(event)) as LoadData;

		expect(data.similar).toHaveLength(1);
		expect(data.similar[0]).toMatchObject({
			slug: published.slug,
			authorName: 'Vera Vraagsteller'
		});
	});

	test('searches for nothing until the draft is complete', async () => {
		const { politician } = await createPolitician();

		const withoutKamerlid = (await page.load(makeLoadEvent(null, '?vraag=toeslagen'))) as LoadData;
		const withoutQuestion = (await page.load(
			makeLoadEvent(politician, '?aan=jan-jansen')
		)) as LoadData;

		expect(withoutKamerlid.similar).toEqual([]);
		expect(withoutQuestion.similar).toEqual([]);
	});
});

describe('default action', () => {
	test('creates the question and redirects a signed-in asker', async () => {
		const { politician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(asker, {
			...questionFields,
			email: asker.email,
			politicianId: politician.id
		});

		await expect(page.actions.default(event)).rejects.toMatchObject({
			status: 303,
			location: '/vragen/wat-vindt-u-van-de-toeslagen'
		});

		const question = await getQuestionBySlug('wat-vindt-u-van-de-toeslagen');
		expect(question).toMatchObject({ userId: asker.id, status: 'pending' });
		expect(question.verifiedAt).not.toBeNull();
		expect(sendSignInLink).not.toHaveBeenCalled();
	});

	test('sends a confirmation link for an anonymous asker', async () => {
		const { politician } = await createPolitician();
		const email = `nieuw-${crypto.randomUUID()}@test.example`;
		const event = myMakeActionEvent(null, { ...questionFields, email, politicianId: politician.id });

		const result = await page.actions.default(event);

		expect(result).toEqual({ email });
		const question = await getQuestionBySlug('wat-vindt-u-van-de-toeslagen');
		expect(question.verifiedAt).toBeNull();
		expect(sendSignInLink).toHaveBeenCalledWith(
			email,
			'http://localhost/vragen/wat-vindt-u-van-de-toeslagen?doel=bevestigen'
		);
		const user = await getUserByEmail(email)
    expect(user.tAndCAccepted).toBeTruthy();
	});

	test('redirects to gegevens page if email exists for anonymous user', async () => {
		const { politician } = await createPolitician();
		const previousAsker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(null, {
			...questionFields,
			email: previousAsker.email,
			politicianId: politician.id
		});

		await expect(page.actions.default(event)).rejects.toMatchObject({
			status: 303,
			location: '/vragen/stellen/gegevens'
		});

		expect(await db.select().from(schema.question)).toHaveLength(0);
	});

	test('rejects a forbidden asker', async () => {
		const { politician } = await createPolitician();
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const event = myMakeActionEvent(moderator, {
			...questionFields,
			email: moderator.email,
			politicianId: politician.id
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 403,
			data: { error: "Met dit account kun je geen vragen stellen." }
		});

		expect(await db.select().from(schema.question)).toHaveLength(0);
		expect(sendSignInLink).not.toHaveBeenCalled();
	});

	test('refuses a signed-in user without ask permission', async () => {
		const { politician, politicianUser } = await createPolitician();
		const event = myMakeActionEvent(politicianUser, {
			...questionFields,
			email: politicianUser.email,
			politicianId: politician.id
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 403 });
		expect(await db.select().from(schema.question)).toHaveLength(0);
	});

	test('rejects an inactive politician with a field issue', async () => {
		const { politician } = await createPolitician('Jan Jansen', { isActive: false });
		const asker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(asker, {
			...questionFields,
			email: asker.email,
			politicianId: politician.id
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 400,
			data: { issues: { politicianId: expect.anything() } }
		});
		expect(await db.select().from(schema.question)).toHaveLength(0);
	});

	test('rejects a politician that does not accept questions', async () => {
		const { politician } = await createPolitician('Jan Jansen', { acceptsQuestions: false });
		const asker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(asker, {
			...questionFields,
			email: asker.email,
			politicianId: politician.id
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 400,
			data: { issues: { politicianId: expect.anything() } }
		});
		expect(await db.select().from(schema.question)).toHaveLength(0);
	});

	test('refuses a question longer than the shared limit', async () => {
		const { politician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(asker, {
			...questionFields,
			title: 'a'.repeat(QUESTION_TITLE_MAX_LENGTH + 1),
			email: asker.email,
			politicianId: politician.id
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400, data: { issues: { title: expect.anything() } } });
		expect(await db.select().from(schema.question)).toHaveLength(0);
	});

	test('fails on an invalid form', async () => {
		const asker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(asker, { email: 'geen-email' });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 400,
			data: { issues: { email: expect.anything(), title: expect.anything() } }
		});
		expect(sendSignInLink).not.toHaveBeenCalled();
	});
});
