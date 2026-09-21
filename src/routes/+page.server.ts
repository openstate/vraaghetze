import * as questions from '$lib/server/questions';
import type { PageServerLoad } from './$types';

const ANSWERED_QUESTIONS = 4;

export const load: PageServerLoad = async () => {
	const answered = await questions.listAnswered(ANSWERED_QUESTIONS);
	const statValues = await questions.questionStats();

	return { questions: answered, statValues };
};
