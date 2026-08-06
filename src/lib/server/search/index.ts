import { and, asc, count, desc, eq, or, sql, type SQL } from 'drizzle-orm';
import { type AnyPgColumn } from 'drizzle-orm/pg-core';
import { schema, type Transaction } from '$lib/server/db';

const WORD_MIN_LENGTH = 2;

function splitWords(term: string) {
	// splits on every run of characters that is neither a letter nor a digit
	return term.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= WORD_MIN_LENGTH);
}

const query = (word: string) => sql`plainto_tsquery('dutch', ${word})`;

export type TermTarget = { columns: AnyPgColumn[]; vector?: SQL };

export function matchesTerm(term: string, { columns, vector }: TermTarget) {
	function matchesWord(word: string) {
		// matches if part of a column shares 60% of the word's 3-letter chunks ("klimaat" and "beleid" find "klimaatbeleid")
		const conditions = columns.map((column) => sql`${word} <% coalesce(${column}, '')`);

		if (vector) {
			// matches if the vector has the word as a whole word in any grammatical form ("vragen" finds "vraag")
			conditions.push(sql`(${vector}) @@ ${query(word)}`);
			// passes if the word is a stop word and thus does not need to be matched
			conditions.push(sql`numnode(${query(word)}) = 0`);
		}

		return or(...conditions);
	}

	return and(...splitWords(term).map(matchesWord)) ?? sql`true`;
}

export const activeFractions = (tx: Transaction) =>
	tx
		.select({
			id: schema.fraction.id,
			slug: schema.fraction.slug,
			name: schema.fraction.name,
			abbreviation: schema.fraction.abbreviation
		})
		.from(schema.fraction)
		.leftJoin(
			schema.politician,
			and(
				eq(schema.politician.fractionId, schema.fraction.id),
				eq(schema.politician.isActive, true)
			)
		)
		.where(eq(schema.fraction.isActive, true))
		.groupBy(schema.fraction.id)
		// the biggest fractions first, alphabetically among equals
		.orderBy(
			desc(count(schema.politician.id)),
			asc(sql`coalesce(${schema.fraction.abbreviation}, ${schema.fraction.name})`)
		);
