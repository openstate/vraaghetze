import { searchPoliticians } from '$lib/server/search/politicians';
import { parsePagination } from '$lib/pagination';
import { parsePoliticianSearch, POLITICIANS_PER_PAGE } from '$lib/search';
import type { PageServerLoad } from './$types';
import { hasPermission } from '$lib/permissions';

export const load: PageServerLoad = async ({ url, locals }) => {
	const query = parsePoliticianSearch(url);

	const pagination = { page: parsePagination(url).page, perPage: POLITICIANS_PER_PAGE }; // hardcode perPage

	const result = await searchPoliticians(query, pagination);

	const mayAsk = hasPermission(locals.user, { question: ['ask'] });
	const mayModerate = hasPermission(locals.user, { question: ['moderate'] });

	return { ...result, query, mayAsk, mayModerate, ...pagination, meta: { title: 'Kamerleden' } };
};
