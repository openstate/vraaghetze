import { error } from '@sveltejs/kit';
import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const result = await questions.bySlug(params.slug, locals.user?.id ?? null);
	if (!result) error(404, 'Vraag niet gevonden');

	return result;
};
