import { fail, error } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import * as moderation from '$lib/server/moderation';
import type { Actions, PageServerLoad } from './$types';
import { safeReturnTo } from '$lib/general';

export const load: PageServerLoad = async ({ params }) => {
	const [answer] = await moderation.getAnswerEnriched(params.slug);
	if (!answer) error(404, 'Antwoord niet gevonden');
	return { answer: answer };
};

export const actions = {
	default: async ({ request, locals, url, cookies }) => {
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
				const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
				if (returnTo) {
					return redirect(
						returnTo.toString(),
						{ type: result.flashType ?? 'neutral', message: result.message ?? '' },
						cookies
					);
				}
				return { answerId: result.answerId, redacted: true };
			}

			const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
			if (returnTo) {
				return redirect(
					returnTo.toString(),
					{ type: result.flashType ?? 'neutral', message: result.message ?? '' },
					cookies
				);
			}
			return { moderated: result.answerId };
		} else {
			return fail(result.statusCode ?? 400, { error: result.message });
		}
	}
} satisfies Actions;
