import {
	and,
	count,
	desc,
	eq,
	gt,
	inArray,
	isNull,
	ne,
	notExists,
	or,
	sql,
	type SQL
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, schema, type Transaction } from '$lib/server/db';
import { splitWords } from '$lib/server/search';
import { slugify, slugifyUnique } from '$lib/server/utils/slug';
import { hasPermission } from '$lib/permissions';

export const politicianUser = alias(schema.user, 'politicianUser');
export const newerAnswer = alias(schema.answer, 'newerAnswer');

// approved rows for everyone, a signed-in user also sees their own regardless of status
export const isVisibleTo = (
	table: typeof schema.question | typeof schema.answer | typeof newerAnswer,
	viewerId: string | null
) => or(eq(table.status, 'approved'), viewerId ? eq(table.userId, viewerId) : undefined);

// a politician can follow up on a pending or rejected answer, so a question may have several.
// join only the newest visible one, otherwise the question repeats once per answer
export const latestAnswer = (viewerId: string | null) =>
	and(
		eq(schema.answer.questionId, schema.question.id),
		isVisibleTo(schema.answer, viewerId),
		notExists(
			db
				.select({ newer: sql`1` })
				.from(newerAnswer)
				.where(
					and(
						eq(newerAnswer.questionId, schema.question.id),
						isVisibleTo(newerAnswer, viewerId),
						gt(newerAnswer.createdAt, schema.answer.createdAt)
					)
				)
		)
	);

export const answerColumns = {
	answerBody: schema.answer.body,
	answerCreatedAt: schema.answer.createdAt
};

type AnswerRow = {
	answerBody: string | null;
	answerCreatedAt: Date | null;
};

// fold the flat left-joined answer columns into a nested object, null when unanswered
export const nestAnswer = <Row extends AnswerRow>(rows: Row[]) =>
	rows.map(({ answerBody, answerCreatedAt, ...question }) => ({
		...question,
		answer:
			answerBody === null || answerCreatedAt === null
				? null
				: { body: answerBody, createdAt: answerCreatedAt }
	}));

// what a question card renders, wherever questions are listed
const cardColumns = {
	slug: schema.question.slug,
	title: schema.question.title,
	createdAt: schema.question.createdAt,
	authorName: schema.user.name,
	politicianName: politicianUser.name,
	politicianSlug: schema.politician.slug,
	fraction: schema.fraction.abbreviation,
	fractionName: schema.fraction.name,
	...answerColumns
};

// the public record of what this politician was asked
export async function listForPolitician(slug: string, limit: number) {
	const rows = await db
		.select(cardColumns)
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.leftJoin(schema.answer, latestAnswer(null))
		.where(and(eq(schema.politician.slug, slug), eq(schema.question.status, 'approved')))
		.orderBy(desc(schema.question.createdAt))
		.limit(limit);

	return nestAnswer(rows);
}

// the homepage showcase, so only publicly answered questions, the freshest answer first
export async function listAnswered(limit: number) {
	const rows = await db
		.select(cardColumns)
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.innerJoin(schema.answer, latestAnswer(null))
		.where(eq(schema.question.status, 'approved'))
		.orderBy(desc(schema.answer.createdAt))
		.limit(limit);

	// the inner join guarantees an answer, so nest it without the null case
	return rows.map(({ answerBody, answerCreatedAt, ...question }) => ({
		...question,
		answer: { body: answerBody, createdAt: answerCreatedAt }
	}));
}

// the similarity searching already excludes stopwords, but we should also exclude the following from matching
const QUESTION_WORDS = new Set([
	'hoe',
	'hoelang',
	'hoeveel',
	'hoezo',
	'waar',
	'waarin',
	'waarmee',
	'waarom',
	'waarop',
	'waarover',
	'waaruit',
	'waarvoor',
	'wanneer',
	'wat',
	'welk',
	'welke',
	'wie'
]);

const isSubjectWord = (word: string) => !QUESTION_WORDS.has(word.toLowerCase());

// :* turns the term into a prefix match, so 'stikstof' also finds 'stikstofcrisis'
const queryTerm = (lexeme: string, prefix: boolean) =>
	`'${lexeme.replaceAll("'", "''")}'${prefix ? ':*' : ''}`;

const MIN_COMPOUND_PART = 5;
const MIN_COMPOUND_REST = 3;

// a lexeme and every cut of it, so 'stikstofcrisis' also finds 'stikstof' and 'crisis'
function compoundTerms(lexeme: string) {
	const terms = [queryTerm(lexeme, lexeme.length >= MIN_COMPOUND_PART)];

	for (
		let partLength = MIN_COMPOUND_PART;
		partLength <= lexeme.length - MIN_COMPOUND_REST;
		partLength++
	) {
		terms.push(queryTerm(lexeme.slice(0, partLength), false));
		terms.push(queryTerm(lexeme.slice(-partLength), false));
	}

	return terms;
}

// approved questions matching any of the terms, best overlap first
async function rankedByTerms(terms: Set<string>, scope: SQL, limit: number) {
	// OR-ed, so any shared word makes another question a candidate
	const query = sql`to_tsquery('dutch', ${[...terms].join(' | ')})`;

	const rows = await db
		.select(cardColumns)
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.leftJoin(schema.answer, latestAnswer(null))
		.where(
			and(
				// approved only and no viewer, so this shows nothing /vragen does not already show
				eq(schema.question.status, 'approved'),
				scope,
				sql`${schema.question.searchVector} @@ ${query}`
			)
		)
		// the strongest overlap first, the newest question among equals
		.orderBy(
			desc(sql`ts_rank(${schema.question.searchVector}, ${query})`),
			desc(schema.question.createdAt)
		)
		.limit(limit);

	return nestAnswer(rows);
}

// what else was asked about the same subject, shown under a question
export async function relatedTo(slug: string, limit: number) {
	const [source] = await db
		// every non-stop word of the title and body
		.select({ lexemes: sql<string[]>`tsvector_to_array(${schema.question.searchVector})` })
		.from(schema.question)
		.where(eq(schema.question.slug, slug))
		.limit(1);

	const lexemes = source?.lexemes.filter(isSubjectWord) ?? [];
	if (lexemes.length === 0) return [];

	const terms = new Set(lexemes.flatMap((lexeme) => compoundTerms(lexeme)));

	return rankedByTerms(terms, ne(schema.question.slug, slug), limit);
}

// how many words of the typed text end up in the query, so a long body stays affordable
// to search for while the asker is still typing
const SIMILAR_MAX_WORDS = 12;

// what the picked politician's fraction was already asked, from the text an asker is typing.
// the sibling of relatedTo for people who have no question yet, so duplicates surface
// before one is created
export async function similarForFraction(text: string, politicianId: string, limit: number) {
	const words = splitWords(text).filter(isSubjectWord).slice(0, SIMILAR_MAX_WORDS);
	if (words.length === 0) return [];

	// to_tsquery normalises the terms itself, so raw words need no stemming beforehand
	const terms = new Set(words.flatMap((word) => compoundTerms(word)));

	// the fraction the picked politician sits in, empty when they are unknown or inactive
	const askableFraction = db
		.select({ fractionId: schema.politician.fractionId })
		.from(schema.politician)
		.where(and(eq(schema.politician.id, politicianId), eq(schema.politician.isActive, true)));

	// the fraction a question was addressed to, snapshotted when it was asked
	return rankedByTerms(terms, inArray(schema.question.assigneeFractionId, askableFraction), limit);
}

// a public figure about a politician, so it counts approved rows only, whoever is looking
export async function statsForPolitician(slug: string) {
	const [stats] = await db
		.select({
			total: count(),
			answered: count(schema.answer.id)
		})
		.from(schema.question)
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		// no viewer, so this joins the newest approved answer and nothing else
		.leftJoin(schema.answer, latestAnswer(null))
		.where(and(eq(schema.politician.slug, slug), eq(schema.question.status, 'approved')));

	return stats;
}

export async function listForUser(userId: string) {
	const rows = await db
		// the owner's own list is the one place a card also shows the moderation status
		.select({ ...cardColumns, status: schema.question.status })
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.leftJoin(schema.answer, latestAnswer(userId))
		// no status filter: the owner sees all their own questions, verified or not
		.where(eq(schema.question.userId, userId))
		.orderBy(desc(schema.question.createdAt));

	return nestAnswer(rows);
}

export async function bySlug(slug: string, viewerId: string | null) {
	const [question] = await db
		.select({
			id: schema.question.id,
			title: schema.question.title,
			body: schema.question.body,
			status: schema.question.status,
			createdAt: schema.question.createdAt,
			authorName: schema.user.name,
			assigneeName: politicianUser.name,
			assigneeSlug: schema.politician.slug,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.innerJoin(schema.politician, eq(schema.question.assigneeId, schema.politician.userId))
		.leftJoin(schema.fraction, eq(schema.question.assigneeFractionId, schema.fraction.id))
		.where(and(eq(schema.question.slug, slug), isVisibleTo(schema.question, viewerId)))
		.limit(1);

	// the question doesn't exist or the viewer can't see it, which is indistinguishable on purpose
	if (!question) return null;

	const [answer] = await db
		.select({
			id: schema.answer.id,
			body: schema.answer.body,
			status: schema.answer.status,
			createdAt: schema.answer.createdAt,
			authorName: schema.user.name
		})
		.from(schema.answer)
		.innerJoin(schema.user, eq(schema.answer.userId, schema.user.id))
		.where(and(eq(schema.answer.questionId, question.id), isVisibleTo(schema.answer, viewerId)))
		// a follow-up reply supersedes the one before it
		.orderBy(desc(schema.answer.createdAt))
		.limit(1);

	return { question, answer: answer ?? null };
}

const reservedSlugs = ['stellen'] as const;

async function slugifyUniqueQuestion(tx: Transaction, title: string) {
	const base = slugify(title) || 'vraag';

	const existing = await tx
		.select({ slug: schema.question.slug })
		.from(schema.question)
		.where(
			or(eq(schema.question.slug, base), sql`${schema.question.slug} ~ ${`^${base}-[0-9]+$`}`)
		);

	const taken = new Set<string>([...reservedSlugs, ...existing.map((row) => row.slug)]);

	return slugifyUnique(base, taken);
}

type CreateQuestion = {
	name: string;
	email: string;
	title: string;
	body: string;
	politicianId: string;
	currentUserId: string | null;
};

export function create({ name, email, title, body, politicianId, currentUserId }: CreateQuestion) {
	return db.transaction(async (tx) => {
		// questions can only be addressed to currently active politicians
		const [politician] = await tx
			.select({ userId: schema.politician.userId, fractionId: schema.politician.fractionId })
			.from(schema.politician)
			.where(and(eq(schema.politician.id, politicianId), eq(schema.politician.isActive, true)))
			.limit(1);

		if (!politician) return { error: 'unknown-politician' as const };

		let userId = currentUserId;

		// non-signed-in asker: find *or* create a user by email
		if (!userId) {
			const [existing] = await tx
				.select({ id: schema.user.id, role: schema.user.role })
				.from(schema.user)
				.where(eq(schema.user.email, email))
				.limit(1);

			if (!hasPermission(existing, { question: ['ask'] })) {
				// user exists for email but is not allowed to ask questions, so error
				return { error: 'forbidden-asker' as const };
			} else if (existing) {
				// user exists for email and is allowed to ask questions, so link unverified question to that user
				userId = existing.id;
			} else {
				// user doesn't exist for email, so create a new user
				userId = crypto.randomUUID();
				await tx.insert(schema.user).values({ id: userId, name, email });
			}
		}

		const slug = await slugifyUniqueQuestion(tx, title);

		await tx.insert(schema.question).values({
			id: crypto.randomUUID(),
			userId,
			title,
			slug,
			assigneeId: politician.userId,
			assigneeFractionId: politician.fractionId,
			body,
			// signed-in askers are verified immediately, otherwise we need to confirm authorship via e-mail link
			verifiedAt: currentUserId ? new Date() : null
		});

		return { slug };
	});
}

export async function pendingConfirmation(slug: string, userId: string) {
	const [question] = await db
		.select({ verifiedAt: schema.question.verifiedAt })
		.from(schema.question)
		.where(and(eq(schema.question.slug, slug), eq(schema.question.userId, userId)))
		.limit(1);

	if (!question) return null; // not the owner / no such question

	return question.verifiedAt === null;
}

export async function claimQuestion(slug: string, userId: string) {
	const claimed = await db
		.update(schema.question)
		// coalesce keeps the original timestamp, so re-confirming stays idempotent
		.set({ verifiedAt: sql`coalesce(${schema.question.verifiedAt}, now())` })
		.where(and(eq(schema.question.slug, slug), eq(schema.question.userId, userId)))
		.returning({ id: schema.question.id });

	return claimed.length > 0;
}

export async function disownQuestion(slug: string, userId: string) {
	const disowned = await db
		.delete(schema.question)
		.where(
			and(
				eq(schema.question.slug, slug),
				eq(schema.question.userId, userId),
				isNull(schema.question.verifiedAt)
			)
		)
		.returning({ id: schema.question.id });

	return disowned.length > 0;
}
