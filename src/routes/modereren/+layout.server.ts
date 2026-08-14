import * as moderation from '$lib/server/moderation';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { queues: await moderation.countQueues(), meta: { title: 'Moderatie' } };
};
