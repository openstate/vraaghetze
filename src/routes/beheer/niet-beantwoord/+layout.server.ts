import { reminderStats, SEND_REMINDER_AFTER } from '$lib/server/questions';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return {
		stats: await reminderStats(),
		reminderDate: new Date(Date.now() - SEND_REMINDER_AFTER),
		meta: { title: 'Moderatie' }
	};
};
