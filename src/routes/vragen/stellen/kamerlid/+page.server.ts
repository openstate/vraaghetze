import * as politicians from '$lib/server/politicians';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => politicians.listActiveWithCommissions();
