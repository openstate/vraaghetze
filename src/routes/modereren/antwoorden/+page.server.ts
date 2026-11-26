import { fail } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import * as moderation from '$lib/server/moderation';
import * as politicians from '$lib/server/politicians';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const politiciansAndCommissions = await politicians.listActiveWithCommissions();
	const queue = await moderation.listAnswerQueue();
	return { queue, ...politiciansAndCommissions };
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		const result = await moderation.defaultAnswerModerationAction({ request, user: locals.user });
		if (result.success) {
			if (result.action == 'preview' || result.action == 'addRedaction') {
				return {
					answerId: result.answerId,
					redactedBody: result.redactedBody,
					searchTexts: result.searchTexts,
					replaceTexts: result.replaceTexts
				};
			} else if (result.action == 'redact') {
				setFlash({ type: result.flashType ?? 'neutral', message: result.message ?? '' }, cookies);
				return { answerId: result.answerId, redacted: true };
			} else if (result.action == 'change-politician') {
				setFlash({ type: result.flashType ?? 'neutral', message: result.message ?? '' }, cookies);
				return { answerId: result.answerId, politicianChanged: true }
			}

			setFlash({ type: result.flashType ?? 'neutral', message: result.message ?? '' }, cookies);
			return { moderated: result.answerId };
		} else {
			return fail(result.statusCode ?? 400, { answerId: result.answerId, error: result.message });
		}
	}
} satisfies Actions;
