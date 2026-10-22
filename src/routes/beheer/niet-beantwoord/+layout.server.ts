import { SEND_REMINDER_AFTER } from '$lib/general';
import { reminderStats } from '$lib/server/reminders';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const reminderDate = new Date(Date.now() - SEND_REMINDER_AFTER);

	return {
		stats: await reminderStats(reminderDate),
		reminderDate: reminderDate,
		meta: { title: 'Moderatie' }
	};
};
