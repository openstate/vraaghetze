import { error } from '@sveltejs/kit';
import * as politicians from '$lib/server/politicians';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	if (request.headers.get('sec-fetch-site') === 'cross-site') error(403, 'Verboden');

	const image = await politicians.photoBySlug(params.slug);
	const match = image && /^data:([^;]+);base64,(.+)$/s.exec(image);
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
