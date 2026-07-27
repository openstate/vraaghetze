import * as moderation from '$lib/server/moderation';
import { parsePagination } from '$lib/pagination';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pagination = parsePagination(url);
	const inbox = await moderation.listInbox(pagination);
	return { ...inbox, ...pagination };
};
