import { remindersNotAnswered } from '$lib/server/reminders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const questions = await remindersNotAnswered();
	return { questions };
};
