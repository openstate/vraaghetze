import { redirect } from '@sveltejs/kit';
import { ASK_STEPS, draftFromUrl, stepHref, stepIsAhead, stepToAnswer } from '$lib/ask';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, parent, url }) => {
	const { user } = await parent();

	// the step is third in url: ./vragen/stellen/<id>
	const stepId = url.pathname.split('/')[3] ?? '';
	const step = ASK_STEPS.find((candidate) => candidate.id === stepId);

	if (step) {
		const draft = { ...draftFromUrl(url), aan: data.politician?.slug ?? '' };

		// a signed-in asker has no personal details left to fill in
		if (step.id === 'gegevens' && user) redirect(307, stepHref('controle', draft));

		// a step ahead of the answers goes back to the one still owed, exactly as the nav offers them
		if (stepIsAhead(step.id, draft)) redirect(307, stepHref(stepToAnswer(draft), draft));
	}

	return { ...data, meta: step && { title: step.title } };
};
