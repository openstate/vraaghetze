import { listNormalUsers } from '$lib/server/users';
import { parsePagination } from '$lib/pagination';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pagination = parsePagination(url);
	const users = await listNormalUsers(pagination);
	return { ...users, ...pagination };
};
