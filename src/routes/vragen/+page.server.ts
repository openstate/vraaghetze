import { searchQuestions } from '$lib/server/search/questions';
import { parsePagination } from '$lib/pagination';
import { parseQuestionSearch, QUESTIONS_PER_PAGE } from '$lib/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const query = parseQuestionSearch(url);

	const pagination = { page: parsePagination(url).page, perPage: QUESTIONS_PER_PAGE }; // hardcode perPage

	const result = await searchQuestions(query, pagination, locals.user);

	return { ...result, query, ...pagination, meta: { title: 'Vragen & Antwoorden' } };
};
