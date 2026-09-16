import { fail, redirect } from '@sveltejs/kit';
import * as questions from '$lib/server/questions';
import { sendSignInLink, userExists } from '$lib/server/auth';
import { validateForm } from '$lib/server/utils/forms';
import { askSchema, draftFromUrl, stepHref, type AskIssues, type AskQuestionFields } from '$lib/ask';
import { hasPermission } from '$lib/permissions';
import type { Actions, PageServerLoad } from './$types';

const SIMILAR_QUESTIONS = 3;

export const load: PageServerLoad = async ({ parent, url }) => {
	const { politician } = await parent();

	const draft = draftFromUrl(url);

	if (!politician || !draft.vraag) return { similar: [] };

	return {
		similar: await questions.similarForFraction(
			`${draft.vraag} ${draft.context}`.trim(),
			politician.id,
			SIMILAR_QUESTIONS
		)
	};
};

export const actions = {
	default: async ({ request, locals, url }) => {
		const result = await validateForm(request, askSchema);
		if (!result.valid) return fail(400, { issues: result.issues });

		if (!hasPermission(locals.user, { question: ['ask'] }))
			return fail(403, { error: 'Met dit account kun je geen vragen stellen.' });

		const currentUserId = locals.user?.id ?? null;
		const data = result.data as AskQuestionFields;
		const { formType, ...questionFields} = data;

		// existing users should have been forced to login on the gegevens page
		if (!currentUserId && await userExists(data.email)) {
	    const draft = draftFromUrl(url)
	    redirect(303, stepHref('gegevens', draft))
		}

		const created = await questions.create({ ...questionFields, currentUserId });

		if ('error' in created) {
			if (created.error === 'unknown-politician') {
				return fail(400, {
					issues: {
						politicianId: ['Dit Kamerlid bestaat niet of is niet langer actief.']
					} satisfies AskIssues
				});
			}

			// email may not ask questions, respond as if mail was sent to avoid making moderators public
			return { email: questionFields.email };
		}

		if (!currentUserId) {
			const callback = new URL(`/vragen/${created.slug}`, url.origin);
			callback.searchParams.set('doel', 'bevestigen');
			await sendSignInLink(questionFields.email, callback.toString());

			return { email: questionFields.email };
		}

		redirect(303, `/vragen/${created.slug}`);
	}
} satisfies Actions;
