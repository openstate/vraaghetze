import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db, schema } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	if (request.headers.get('sec-fetch-site') === 'cross-site') error(403, 'Verboden');

	const [row] = await db
		.select({ image: schema.user.image })
		.from(schema.politician)
		.innerJoin(schema.user, eq(schema.politician.userId, schema.user.id))
		.where(eq(schema.politician.slug, params.slug))
		.limit(1);

	const match = row?.image && /^data:([^;]+);base64,(.+)$/s.exec(row.image);
	if (!match) error(404, 'Geen foto gevonden');

	const [, contentType, base64] = match;
	const data = Buffer.from(base64, 'base64');

	return new Response(data, {
		headers: {
			'content-type': contentType,
			'content-length': String(data.byteLength),
			'cache-control': 'public, max-age=86400, stale-while-revalidate=604800'
		}
	});
};
