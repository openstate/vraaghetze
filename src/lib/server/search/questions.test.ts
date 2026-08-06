import { beforeEach, describe, expect, test } from 'vitest';
import { db, schema } from '$lib/server/db';
import { parseQuestionSearch, QUESTIONS_PER_PAGE } from '$lib/search';
import { searchQuestions } from './questions';

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
	const [fraction] = await db
		.insert(schema.fraction)
		.values({ id: fractionId, slug: `tf-${fractionId}`, name: 'Testfractie', abbreviation: 'TF' })
		.returning();

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

	return { politician, politicianUser, fraction };
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

async function insertAnswer(
	questionId: string,
	userId: string,
	overrides: Partial<typeof schema.answer.$inferInsert> = {}
) {
	const id = crypto.randomUUID();

	const [answer] = await db
		.insert(schema.answer)
		.values({ id, questionId, userId, body: 'Mijn antwoord.', status: 'approved', ...overrides })
		.returning();

	return answer;
}

function runSearch(
	params: string,
	viewerId: string | null = null,
	pagination = { page: 1, perPage: QUESTIONS_PER_PAGE }
) {
	const query = parseQuestionSearch(new URL(`https://vraaghetze.nu/vragen${params}`));

	return searchQuestions(query, pagination, viewerId);
}

const slugsOf = (rows: { slug: string }[]) => rows.map((row) => row.slug).sort();

beforeEach(async () => {
	await db.transaction(async (tx) => {
		await tx.delete(schema.moderationAction);
		await tx.delete(schema.inbox);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
	});
});

describe('searchQuestions', () => {
	test('shows approved questions to everyone and pending ones only to their owner', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const approved = await insertQuestion(asker.id, politicianUser.id);
		const pending = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });

		const anonymous = await runSearch('');
		const owner = await runSearch('', asker.id);
		const stranger = await runSearch('', politicianUser.id);

		expect(slugsOf(anonymous.questions)).toEqual([approved.slug]);
		expect(slugsOf(owner.questions)).toEqual([approved.slug, pending.slug].sort());
		expect(slugsOf(stranger.questions)).toEqual([approved.slug]);
	});

	describe('matching', () => {
		const corpus = [
			{ label: 'toeslagen', title: 'Wat vindt u van de toeslagen?' },
			{ label: 'klimaatbeleid', title: 'Wat is het klimaatbeleid?' },
			{ label: 'beleid-en-toeslagen', title: 'Wat is het beleid rond toeslagen?' },
			{ label: 'burn-out', title: 'Wat doet u aan de burn-out onder studenten?' },
			{ label: 'coronamaatregelen', title: 'Hoe kijkt u aan tegen de coronamaatregelen?' },
			{
				label: 'onderwijs-huisvesting',
				title: 'Vraag over onderwijs',
				body: 'En de huisvesting dan?'
			},
			{ label: 'stikstof', title: 'Vraag over zorg', answer: 'Er komt meer stikstofruimte.' }
		];

		let slugs: Record<string, string>;

		beforeEach(async () => {
			const { politicianUser } = await createPolitician();
			const asker = await createUser('Vera Vraagsteller');
			slugs = {};

			for (const { label, title, body, answer } of corpus) {
				const question = await insertQuestion(asker.id, politicianUser.id, {
					title,
					body: body ?? 'Kort.'
				});
				if (answer) await insertAnswer(question.id, politicianUser.id, { body: answer });

				slugs[label] = question.slug;
			}
		});

		test.each([
			['onderwijs', ['onderwijs-huisvesting']], // literal term in title
			['toeslagen', ['toeslagen', 'beleid-en-toeslagen']], // literal term in title, matches both
			['stikstofruimte', ['stikstof']], // literal term in body
			['vragen', ['onderwijs-huisvesting', 'stikstof']], // stemming of plurals
			['klimaat', ['klimaatbeleid']], // first half of compound word
			['beleid', ['klimaatbeleid', 'beleid-en-toeslagen']], // second half of compound word
			['beleid toeslagen', ['beleid-en-toeslagen']], // must match both terms
			['onderwijs huisvesting', ['onderwijs-huisvesting']], // term in body and title
			['over klimaatbeleid', ['klimaatbeleid']] // filter out stop words
		] as [string, string[]][])('%s', async (term, labels) => {
			const results = await runSearch(`?q=${encodeURIComponent(term)}`);

			expect(slugsOf(results.questions)).toEqual(labels.map((label) => slugs[label]).sort());
		});

		test.each([
			'onderwijsbudget', // compound word of word that is in corpus
			'toeslagen huisvesting', // both words are in corpus but not in the same question
			'12' // number that is not in corpus
		])('%s finds nothing', async (term) => {
			const results = await runSearch(`?q=${encodeURIComponent(term)}`);

			expect(results.questions).toEqual([]);
			expect(results.total).toBe(0);
		});
	});

	test('a follow-up answer does not duplicate the question', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await insertAnswer(question.id, politicianUser.id, {
			body: 'Eerste poging.',
			status: 'rejected',
			createdAt: new Date('2026-05-01T10:00:00Z')
		});
		await insertAnswer(question.id, politicianUser.id, {
			body: 'Tweede poging.',
			status: 'pending',
			createdAt: new Date('2026-05-02T10:00:00Z')
		});

		const own = await runSearch('', politicianUser.id);
		const anonymous = await runSearch('', null);

		expect(own.questions).toHaveLength(1);
		expect(own.total).toBe(1);
		expect(own.questions[0].answer?.body).toBe('Tweede poging.');
		expect(anonymous.questions).toHaveLength(1);
		expect(anonymous.questions[0].answer).toBeNull();
	});

	test('narrows to the chosen kamerlid', async () => {
		const first = await createPolitician();
		const second = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const hers = await insertQuestion(asker.id, first.politicianUser.id);
		await insertQuestion(asker.id, second.politicianUser.id);

		const result = await runSearch(`?kamerlid=${first.politician.slug}`);

		expect(slugsOf(result.questions)).toEqual([hers.slug]);
		expect(result.total).toBe(1);
	});

	test('sorts results correctly', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const inAnswer = await insertQuestion(asker.id, politicianUser.id, {
			title: 'Vraag over de ggz',
			body: 'Kort.',
			createdAt: new Date('2026-05-01T12:00:00Z')
		});
		await insertAnswer(inAnswer.id, politicianUser.id, { body: 'Wij verwachten hier beterschap.' });
		const inTitle = await insertQuestion(asker.id, politicianUser.id, {
			title: 'Wat doet u aan de levensverwachting?',
			createdAt: new Date('2026-05-02T12:00:00Z')
		});
		const inBody = await insertQuestion(asker.id, politicianUser.id, {
			title: 'Vraag over zorg',
			body: 'Er wordt veel verwacht van de wachttijden.',
			createdAt: new Date('2026-05-03T12:00:00Z')
		});

		const newestByDefault = await runSearch('');
		const oldestFirst = await runSearch('?sorteer=oudste');
		const byRelevance = await runSearch('?q=verwachting');
		const byDateDespiteTerm = await runSearch('?q=verwachting&sorteer=nieuwste');

		expect(newestByDefault.questions.map((row) => row.slug)).toEqual([
			inBody.slug,
			inTitle.slug,
			inAnswer.slug
		]);
		expect(oldestFirst.questions.map((row) => row.slug)).toEqual([
			inAnswer.slug,
			inTitle.slug,
			inBody.slug
		]);
		expect(byRelevance.questions.map((row) => row.slug)).toEqual([
			inTitle.slug,
			inAnswer.slug,
			inBody.slug
		]);
		expect(byDateDespiteTerm.questions.map((row) => row.slug)).toEqual([
			inBody.slug,
			inTitle.slug,
			inAnswer.slug
		]);
	});

	test('correct facet counts', async () => {
		const first = await createPolitician();
		const second = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const inFirst = { assigneeFractionId: first.politician.fractionId };
		const answered = await insertQuestion(asker.id, first.politicianUser.id, inFirst);
		await insertQuestion(asker.id, first.politicianUser.id, inFirst);
		await insertQuestion(asker.id, second.politicianUser.id, {
			assigneeFractionId: second.politician.fractionId
		});
		await insertAnswer(answered.id, first.politicianUser.id);

		const unfiltered = await runSearch('');
		const byFraction = await runSearch(`?fractie=${first.fraction.slug}`);
		const byStatus = await runSearch('?status=beantwoord');

		expect(unfiltered.total).toBe(3);
		expect(unfiltered.facets).toMatchObject({ answered: 1, unanswered: 2 });
		expect(byFraction.total).toBe(2);
		// the fraction facet drops its own filter, so the other fraction still reports its two
		expect(byFraction.facets.fractions.map((row) => row.total).sort()).toEqual([1, 2]);
		// but the politician facet keeps it, so the other fraction's member falls to zero
		expect(byFraction.facets.politicians.map((row) => row.total).sort()).toEqual([0, 2]);
		expect(byStatus.total).toBe(1);
		expect(byStatus.facets).toMatchObject({ answered: 1, unanswered: 2 });
	});

	test('date filter runs on the dutch calendar', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		// 23:30 and 00:30 in Amsterdam, which is 21:30 and 22:30 the same evening in utc
		const lateEvening = await insertQuestion(asker.id, politicianUser.id, {
			createdAt: new Date('2026-05-01T21:30:00Z')
		});
		const justAfterMidnight = await insertQuestion(asker.id, politicianUser.id, {
			createdAt: new Date('2026-05-01T22:30:00Z')
		});

		expect(slugsOf((await runSearch('?tot=2026-05-01')).questions)).toEqual([lateEvening.slug]);
		expect(slugsOf((await runSearch('?van=2026-05-02')).questions)).toEqual([
			justAfterMidnight.slug
		]);
	});

	test('paginates through the results', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		for (const day of [1, 2, 3]) {
			await insertQuestion(asker.id, politicianUser.id, {
				createdAt: new Date(`2026-05-0${day}T12:00:00Z`)
			});
		}

		const firstPage = await runSearch('', null, { page: 1, perPage: 2 });
		const secondPage = await runSearch('', null, { page: 2, perPage: 2 });

		expect(firstPage.questions).toHaveLength(2);
		expect(firstPage.total).toBe(3);
		expect(secondPage.questions).toHaveLength(1);
		expect(secondPage.total).toBe(3);
	});
});
