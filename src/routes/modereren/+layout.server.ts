import { inboxStatuses, parseModerationSearch, questionStatuses, type InboxStatus, type QuestionStatus } from '$lib/moderation';
import * as moderation from '$lib/server/moderation';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const sortOptionsInbox = ['', ...inboxStatuses] as (InboxStatus | '')[];
	const sortOptionsArchive = ['', ...questionStatuses] as (QuestionStatus | '')[];
	const query = parseModerationSearch(url);

	return {
		queues: await moderation.countQueues(),
		meta: { title: 'Moderatie' },
		sortOptionsInbox,
		sortOptionsArchive,
		query
	};
};
