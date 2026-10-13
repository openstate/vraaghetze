import * as moderation from '$lib/server/moderation';
import { parsePagination } from '$lib/pagination';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const parentData = await parent();
	const archiveStatusSelect = parentData.query.archiveStatusSelect;
	const pagination = parsePagination(url);
	const questions = await moderation.listQuestions(pagination, archiveStatusSelect);
	return { ...questions, ...pagination };
};
