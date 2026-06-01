import { redirect } from '@sveltejs/kit';
import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(307, '/inloggen');

	return { questions: await questions.listForUser(locals.user.id) };
};
