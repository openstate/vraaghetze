import { error } from '@sveltejs/kit';
import * as politicians from '$lib/server/politicians';
import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

const PROFILE_QUESTIONS = 5;

export const load: PageServerLoad = async ({ params, locals }) => {
	const politician = await politicians.bySlug(params.slug);
	if (!politician) error(404, 'Politicus niet gevonden');

	return {
		politician,
		commissions: await politicians.commissionsForPolitician(politician.id),
		stats: await questions.statsForPolitician(politician.slug),
		questions: await questions.listForPolitician(politician.slug, PROFILE_QUESTIONS, locals.user?.id ?? null, locals.user?.role == 'admin'),
		meta: { title: politician.name }
	};
};
