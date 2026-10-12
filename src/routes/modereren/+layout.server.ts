import { inboxStatuses, parseModerationSearch, type InboxStatus } from '$lib/moderation';
import * as moderation from '$lib/server/moderation';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const sortOptionsInbox = ['', ...inboxStatuses] as (InboxStatus | '')[];
	const query = parseModerationSearch(url);

	return {
		queues: await moderation.countQueues(),
		meta: { title: 'Moderatie' },
		sortOptionsInbox,
		query
	};
};
