import { and, asc, count, desc, eq, inArray, isNotNull, isNull, sql, type SQL } from 'drizzle-orm';
import { type PgSelect } from 'drizzle-orm/pg-core';
import { db, schema } from '$lib/server/db';
import {
	answerColumns,
	isVisibleTo,
	latestAnswer,
	nestAnswer,
	politicianUser
} from '$lib/server/questions';
import { type QuestionSearchQuery } from '$lib/search';
import type { Pagination } from '$lib/pagination';
import { TIME_ZONE } from '$lib/date-time';
import { activeFractions, matchesTerm } from './index';

const columns = [
	{ column: schema.question.title, weight: 3 },
	{ column: schema.answer.body, weight: 2 },
	{ column: schema.question.body, weight: 1 }
];

const documentVector = sql`${schema.question.searchVector} || coalesce(${schema.answer.searchVector}, '')`;

const matchesQuestion = (term: string) =>
	matchesTerm(term, { columns: columns.map(({ column }) => column), vector: documentVector });

const relevance = (term: string) =>
	sql`greatest(${sql.join(
		columns.map(
			({ column, weight }) => sql`${weight} * word_similarity(${term}, coalesce(${column}, ''))`
		),
		sql`, `
	)})`;

const midnight = (date: SQL) =>
	// the utc moment a Dutch calendar day starts
	sql`((${date})::timestamp at time zone ${TIME_ZONE}) at time zone 'UTC'`;

function joinSearchTables<Query extends PgSelect>(query: Query, viewerId: string | null) {
	return query
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.leftJoin(schema.answer, latestAnswer(viewerId));
}

type SkipFacet = 'status' | 'fraction' | 'politician';

function searchConditions(query: QuestionSearchQuery, viewerId: string | null, skip?: SkipFacet) {
	const conditions: (SQL | undefined)[] = [isVisibleTo(schema.question, viewerId)];

	if (query.term) conditions.push(matchesQuestion(query.term));

	if (skip !== 'status' && query.status !== 'alles')
		conditions.push(
			query.status === 'beantwoord' ? isNotNull(schema.answer.id) : isNull(schema.answer.id)
		);

	if (skip !== 'fraction' && query.fractions.length > 0)
		conditions.push(inArray(schema.fraction.slug, query.fractions));

	if (skip !== 'politician' && query.politicians.length > 0)
		conditions.push(inArray(schema.politician.slug, query.politicians));

	if (query.from)
		conditions.push(sql`${schema.question.createdAt} >= ${midnight(sql`${query.from}::date`)}`);

	if (query.until)
		conditions.push(sql`${schema.question.createdAt} < ${midnight(sql`${query.until}::date + 1`)}`);

	return and(...conditions);
}

function searchOrderBy(query: QuestionSearchQuery) {
	if (query.sort === 'oudste') return [asc(schema.question.createdAt)];
	if (query.sort === 'nieuwste') return [desc(schema.question.createdAt)];
	return [desc(relevance(query.term)), desc(schema.question.createdAt)];
}

export function searchQuestions(
	query: QuestionSearchQuery,
	{ page, perPage }: Pagination,
	viewerId: string | null
) {
	return db.transaction(async (tx) => {
		const rows = await joinSearchTables(
			tx
				.select({
					slug: schema.question.slug,
					title: schema.question.title,
					createdAt: schema.question.createdAt,
					authorName: schema.user.name,
					politicianName: politicianUser.name,
					politicianSlug: schema.politician.slug,
					fraction: schema.fraction.abbreviation,
					fractionName: schema.fraction.name,
					...answerColumns
				})
				.from(schema.question)
				.$dynamic(), // so joinSearchTables can keep building on this query
			viewerId
		)
			.where(searchConditions(query, viewerId))
			.orderBy(...searchOrderBy(query))
			.limit(perPage)
			.offset((page - 1) * perPage);

		const [{ total }] = await joinSearchTables(
			tx.select({ total: count() }).from(schema.question).$dynamic(),
			viewerId
		).where(searchConditions(query, viewerId));

		const [answerCounts] = await joinSearchTables(
			tx
				.select({
					answered: count(schema.answer.id),
					unanswered: sql<number>`count(*) filter (where ${schema.answer.id} is null)`.mapWith(
						Number
					)
				})
				.from(schema.question)
				.$dynamic(),
			viewerId
		).where(searchConditions(query, viewerId, 'status'));

		const fractionCounts = await joinSearchTables(
			tx.select({ slug: schema.fraction.slug, total: count() }).from(schema.question).$dynamic(),
			viewerId
		)
			.where(searchConditions(query, viewerId, 'fraction'))
			.groupBy(schema.fraction.slug);

		const politicianCounts = await joinSearchTables(
			tx.select({ slug: schema.politician.slug, total: count() }).from(schema.question).$dynamic(),
			viewerId
		)
			.where(searchConditions(query, viewerId, 'politician'))
			.groupBy(schema.politician.slug);

		const fractions = await activeFractions(tx);

		const politicians = await tx
			.select({ slug: schema.politician.slug, name: schema.user.name })
			.from(schema.politician)
			.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
			.where(eq(schema.politician.isActive, true))
			.orderBy(asc(schema.user.name));

		const countBySlug = new Map(politicianCounts.map((row) => [row.slug, row.total]));
		const countByFraction = new Map(fractionCounts.map((row) => [row.slug, row.total]));

		return {
			questions: nestAnswer(rows),
			total,
			facets: {
				answered: answerCounts.answered,
				unanswered: answerCounts.unanswered,
				fractions: fractions.map((fraction) => ({
					...fraction,
					total: countByFraction.get(fraction.slug) ?? 0
				})),
				politicians: politicians.map((politician) => ({
					...politician,
					total: countBySlug.get(politician.slug) ?? 0
				}))
			}
		};
	});
}
