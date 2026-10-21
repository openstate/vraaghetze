import { remindersAlreadyReminded } from '$lib/server/reminders';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async () => {
	const questions = await remindersAlreadyReminded();
	return { questions };
};
