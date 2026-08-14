import * as politicians from '$lib/server/politicians';
import { hasPermission } from '$lib/permissions';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const slug = url.searchParams.get('aan');
	const politician = slug ? await politicians.bySlug(slug) : undefined;

	return {
		politician: politician?.isActive ? politician : null,
		mayAsk: hasPermission(locals.user, { question: ['ask'] })
	};
};
