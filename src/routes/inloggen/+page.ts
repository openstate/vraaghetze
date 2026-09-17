import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	if (data.user) redirect(307, '/profiel');

	return { ...data, meta: { title: 'Inloggen' } };
};
