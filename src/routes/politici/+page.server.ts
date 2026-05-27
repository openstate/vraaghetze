import { eq, sql } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';

export async function load() {
	const politicians = await db
		.select({
			id: schema.politician.id,
			slug: schema.politician.slug,
			fractionRole: schema.politician.fractionRole,
			name: schema.user.name,
			hasImage: sql<boolean>`${schema.user.image} is not null`,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.politician)
		.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
		.innerJoin(schema.fraction, eq(schema.politician.fractionId, schema.fraction.id))
		.where(eq(schema.politician.isActive, true));

	return { politicians };
}
