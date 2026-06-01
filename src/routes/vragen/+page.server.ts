import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	questions: await questions.list(locals.user?.id ?? null)
});
