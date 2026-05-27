import { eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [politician] = await db
		.select({
			slug: schema.politician.slug,
			name: schema.user.name,
			fractionRole: schema.politician.fractionRole,
			hasImage: sql<boolean>`${schema.user.image} is not null`,
			fraction: schema.fraction.abbreviation,
			fractionName: schema.fraction.name
		})
		.from(schema.politician)
		.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
		.innerJoin(schema.fraction, eq(schema.politician.fractionId, schema.fraction.id))
		.where(eq(schema.politician.slug, params.slug))
		.limit(1);

	if (!politician) error(404, 'Politicus niet gevonden');

	return { politician };
};
