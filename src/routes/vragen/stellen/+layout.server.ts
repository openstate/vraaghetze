import * as politicians from '$lib/server/politicians';
import { hasPermission } from '$lib/permissions';
import type { LayoutServerLoad } from './$types';
import type { PageWidthType } from '$lib/components/page.svelte';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const slug = url.searchParams.get('aan');
	const politician = slug ? await politicians.bySlug(slug) : undefined;
	const pageWidth: PageWidthType = url.pathname.startsWith('/vragen/stellen/vraag')
		? 'wide'
		: 'content';
	const changing = url.searchParams.get('changing');

	return {
		politician: politician?.isActive && politician?.acceptsQuestions ? politician : null,
		mayAsk: hasPermission(locals.user, { question: ['ask'] }),
		mayModerate: hasPermission(locals.user, { question: ['moderate'] }),
		pageWidth: pageWidth,
		changing: changing
	};
};
