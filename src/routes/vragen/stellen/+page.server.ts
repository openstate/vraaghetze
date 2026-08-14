import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const step = url.searchParams.has('aan') ? 'vraag' : 'kamerlid';

	redirect(307, `/vragen/stellen/${step}${url.search}`);
};
