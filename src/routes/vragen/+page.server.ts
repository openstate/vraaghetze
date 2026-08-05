import { search } from '$lib/server/search';
import { parsePagination } from '$lib/pagination';
import { parseSearch, RESULTS_PER_PAGE } from '$lib/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const query = parseSearch(url);

	const pagination = { page: parsePagination(url).page, perPage: RESULTS_PER_PAGE }; // hardcode perPage

	const result = await search(query, pagination, locals.user?.id ?? null);

	return { ...result, query, ...pagination, meta: { title: 'Vragen & Antwoorden' } };
};
