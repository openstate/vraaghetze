import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

const ANSWERED_QUESTIONS = 4;

export const load: PageServerLoad = async () => {
	return { questions: await questions.listAnswered(ANSWERED_QUESTIONS) };
};
