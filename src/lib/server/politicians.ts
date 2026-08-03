import { asc, eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';

export function listActive() {
	return db
		.select({
			id: schema.politician.id,
			slug: schema.politician.slug,
			fractionRole: schema.politician.fractionRole,
			name: schema.user.name,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.politician)
		.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
		.innerJoin(schema.fraction, eq(schema.politician.fractionId, schema.fraction.id))
		.where(eq(schema.politician.isActive, true))
		.orderBy(asc(schema.user.name));
}

export async function bySlug(slug: string) {
	const [politician] = await db
		.select({
			slug: schema.politician.slug,
			userId: schema.politician.userId,
			name: schema.user.name,
			fractionRole: schema.politician.fractionRole,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.politician)
		.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
		.innerJoin(schema.fraction, eq(schema.politician.fractionId, schema.fraction.id))
		.where(eq(schema.politician.slug, slug))
		.limit(1);

	return politician;
}

export async function photoBySlug(slug: string) {
	const [row] = await db
		.select({ image: schema.user.image })
		.from(schema.politician)
		.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
		.where(eq(schema.politician.slug, slug))
		.limit(1);

	return row?.image ?? null;
}
