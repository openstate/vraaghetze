import { beforeEach, describe, expect, test } from 'vitest';
import { db, schema } from '$lib/server/db';
import { parsePoliticianSearch, POLITICIANS_PER_PAGE } from '$lib/search';
import { searchPoliticians } from './politicians';

async function createUser(name: string, overrides: Partial<typeof schema.user.$inferInsert> = {}) {
	const id = crypto.randomUUID();

	const [created] = await db
		.insert(schema.user)
		.values({ id, name, email: `${id}@test.example`, emailVerified: true, ...overrides })
		.returning();

	return created;
}

async function createPolitician(
	name: string,
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

async function createCommission(overrides: Partial<typeof schema.commission.$inferInsert> = {}) {
	const [commission] = await db
		.insert(schema.commission)
		.values({
			id: crypto.randomUUID(),
			abbreviation: 'OCW',
			name: 'Vaste commissie voor Onderwijs, Cultuur en Wetenschap',
			shortName: 'Onderwijs, Cultuur en Wetenschap',
			kind: 'Vaste commissies',
			...overrides
		})
		.returning();

	return commission;
}

async function addCommissionMember(commissionId: string, politicianId: string) {
	await db
		.insert(schema.commissionMembership)
		.values({ id: crypto.randomUUID(), commissionId, politicianId, startedAt: new Date() });
}

function runSearch(params: string, pagination = { page: 1, perPage: POLITICIANS_PER_PAGE }) {
	const query = parsePoliticianSearch(new URL(`https://vraaghetze.nu/politici${params}`));

	return searchPoliticians(query, pagination);
}

beforeEach(async () => {
	await db.transaction(async (tx) => {
		await tx.delete(schema.moderationAction);
		await tx.delete(schema.inbox);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
		await tx.delete(schema.commission);
	});
});

describe('searchPoliticians', () => {
	test('matches politicians by name, hiding inactive ones', async () => {
		const jetten = await createPolitician('Rob Jetten');
		await createPolitician('Pieter Omtzigt');
		await createPolitician('Oud Kamerlid', { isActive: false });

		const everyone = await runSearch('');
		const byName = await runSearch('?q=jetten');

		expect(everyone.politicians.map((row) => row.name)).toEqual(['Pieter Omtzigt', 'Rob Jetten']);
		expect(byName.politicians.map((row) => row.slug)).toEqual([jetten.politician.slug]);
	});

	test('narrows to the chosen fractions', async () => {
		const chosen = await createPolitician('Anna Aardema');
		await createPolitician('Bert Bergkamp');

		const result = await runSearch(`?fractie=${chosen.fraction.slug}`);

		expect(result.politicians.map((row) => row.slug)).toEqual([chosen.politician.slug]);
		// the fraction facet drops its own filter, so the other fraction still reports its member
		expect(result.facets.fractions.map((row) => row.total).sort()).toEqual([1, 1]);
	});

	test('narrows to commission members, keeping delegations out of the facet', async () => {
		const member = await createPolitician('Carla Commissielid');
		const delegate = await createPolitician('Dirk Delegatielid');
		const commission = await createCommission();
		const delegation = await createCommission({
			abbreviation: 'NAVO',
			kind: 'Delegaties naar internationale vergaderingen'
		});
		await addCommissionMember(commission.id, member.politician.id);
		await addCommissionMember(delegation.id, delegate.politician.id);

		const result = await runSearch('?commissie=OCW');

		expect(result.politicians.map((row) => row.slug)).toEqual([member.politician.slug]);
		expect(result.facets.commissions).toMatchObject([{ id: commission.id, total: 1 }]);
	});

	test('paginates through the results', async () => {
		await createPolitician('Anna Aardema');
		await createPolitician('Bert Bergkamp');
		await createPolitician('Carla Cornelissen');

		const firstPage = await runSearch('', { page: 1, perPage: 2 });
		const secondPage = await runSearch('', { page: 2, perPage: 2 });

		expect(firstPage.politicians).toHaveLength(2);
		expect(firstPage.total).toBe(3);
		expect(secondPage.politicians).toHaveLength(1);
		expect(secondPage.total).toBe(3);
	});
});
