import { and, asc, count, countDistinct, eq, exists, inArray, sql, type SQL } from 'drizzle-orm';
import { type PgSelect } from 'drizzle-orm/pg-core';
import { db, schema } from '$lib/server/db';
import { COMMISSION_KIND } from '$lib/server/politicians';
import { type PoliticianSearchQuery } from '$lib/search';
import type { Pagination } from '$lib/pagination';
import { activeFractions, matchesTerm } from './index';

// matches if the politician holds a seat in one of the named commissions
const isCommissionMember = (abbreviations: string[]) =>
	exists(
		db
			.select({ seat: sql`1` })
			.from(schema.commissionMembership)
			.innerJoin(
				schema.commission,
				and(
					eq(schema.commissionMembership.commissionId, schema.commission.id),
					eq(schema.commission.kind, COMMISSION_KIND)
				)
			)
			.where(
				and(
					eq(schema.commissionMembership.politicianId, schema.politician.id),
					inArray(schema.commission.abbreviation, abbreviations)
				)
			)
	);

function joinSearchTables<Query extends PgSelect>(query: Query) {
	return query
		.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
		.innerJoin(schema.fraction, eq(schema.politician.fractionId, schema.fraction.id));
}

type SkipFacet = 'fraction' | 'commission';

function searchConditions(query: PoliticianSearchQuery, skip?: SkipFacet) {
	const conditions: (SQL | undefined)[] = [eq(schema.politician.isActive, true)];

	if (query.term) conditions.push(matchesTerm(query.term, { columns: [schema.user.name] }));

	if (skip !== 'fraction' && query.fractions.length > 0)
		conditions.push(inArray(schema.fraction.slug, query.fractions));

	if (skip !== 'commission' && query.commissions.length > 0)
		conditions.push(isCommissionMember(query.commissions));

	return and(...conditions);
}

export function searchPoliticians(query: PoliticianSearchQuery, { page, perPage }: Pagination) {
	return db.transaction(async (tx) => {
		const politicians = await joinSearchTables(
			tx
				.select({
					id: schema.politician.id,
					slug: schema.politician.slug,
					fractionRole: schema.politician.fractionRole,
					name: schema.user.name,
					fraction: schema.fraction.abbreviation,
					fractionName: schema.fraction.name
				})
				.from(schema.politician)
				.$dynamic() // so joinSearchTables can keep building on this query
		)
			.where(searchConditions(query))
			.orderBy(asc(schema.user.name))
			.limit(perPage)
			.offset((page - 1) * perPage);

		const [{ total }] = await joinSearchTables(
			tx.select({ total: count() }).from(schema.politician).$dynamic()
		).where(searchConditions(query));

		const fractionCounts = await joinSearchTables(
			tx.select({ slug: schema.fraction.slug, total: count() }).from(schema.politician).$dynamic()
		)
			.where(searchConditions(query, 'fraction'))
			.groupBy(schema.fraction.slug);

		const commissionCounts = await joinSearchTables(
			tx
				.select({
					abbreviation: schema.commission.abbreviation,
					total: countDistinct(schema.politician.id)
				})
				.from(schema.politician)
				.$dynamic()
		)
			.innerJoin(
				schema.commissionMembership,
				eq(schema.commissionMembership.politicianId, schema.politician.id)
			)
			.innerJoin(
				schema.commission,
				and(
					eq(schema.commissionMembership.commissionId, schema.commission.id),
					eq(schema.commission.kind, COMMISSION_KIND)
				)
			)
			.where(searchConditions(query, 'commission'))
			.groupBy(schema.commission.abbreviation);

		const fractions = await activeFractions(tx);

		const commissions = await tx
			.select({
				id: schema.commission.id,
				abbreviation: schema.commission.abbreviation,
				name: schema.commission.name,
				shortName: schema.commission.shortName
			})
			.from(schema.commission)
			.where(eq(schema.commission.kind, COMMISSION_KIND))
			.orderBy(asc(schema.commission.shortName));

		const countByFraction = new Map(fractionCounts.map((row) => [row.slug, row.total]));
		const countByCommission = new Map(commissionCounts.map((row) => [row.abbreviation, row.total]));

		return {
			politicians,
			total,
			facets: {
				fractions: fractions.map((fraction) => ({
					...fraction,
					total: countByFraction.get(fraction.slug) ?? 0
				})),
				commissions: commissions.map((commission) => ({
					...commission,
					total: countByCommission.get(commission.abbreviation) ?? 0
				}))
			}
		};
	});
}
