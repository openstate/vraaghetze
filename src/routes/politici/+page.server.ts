import { searchPoliticians } from '$lib/server/search/politicians';
import { parsePagination } from '$lib/pagination';
import { parsePoliticianSearch, POLITICIANS_PER_PAGE } from '$lib/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = parsePoliticianSearch(url);

	const pagination = { page: parsePagination(url).page, perPage: POLITICIANS_PER_PAGE }; // hardcode perPage

	const result = await searchPoliticians(query, pagination);

	return { ...result, query, ...pagination, meta: { title: 'Kamerleden' } };
};
