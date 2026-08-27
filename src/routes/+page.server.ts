import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

const ANSWERED_QUESTIONS = 4;

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent(); // For teaser
	return { questions: await questions.listAnswered(ANSWERED_QUESTIONS, user) };
};
