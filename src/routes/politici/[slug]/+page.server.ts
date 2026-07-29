import { error } from '@sveltejs/kit';
import * as politicians from '$lib/server/politicians';
import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const politician = await politicians.bySlug(params.slug);
	if (!politician) error(404, 'Politicus niet gevonden');

	return {
		politician,
		questions: await questions.listForPolitician(params.slug, locals.user?.id ?? null),
		meta: { title: politician.name }
	};
};
