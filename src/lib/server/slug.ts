import { or, eq, sql } from 'drizzle-orm/sql';
import { schema, type db } from './db';

export function slugify(value: string) {
	return value
		.normalize('NFKD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function slugifyUnique(name: string, taken: Set<string>) {
	const base = slugify(name);
	let slug = base;
	let suffix = 1;
	while (taken.has(slug)) slug = `${base}-${++suffix}`;
	taken.add(slug);
	return slug;
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
const reservedSlugs = ['stellen'] as const;

export async function slugifyUniqueQuestion(tx: Transaction, title: string) {
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
