import { remindersOverdueNoReminder } from '$lib/server/reminders';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();
	const questions = await remindersOverdueNoReminder(parentData.reminderDate);
	return { questions };
};
