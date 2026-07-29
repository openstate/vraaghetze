import * as politicians from '$lib/server/politicians';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	politicians: await politicians.listActive(),
	meta: { title: 'Kamerleden' }
});
