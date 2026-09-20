import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	return { ...data, meta: { title: 'Aan wie moet ik mijn vraag stellen?' } };
};