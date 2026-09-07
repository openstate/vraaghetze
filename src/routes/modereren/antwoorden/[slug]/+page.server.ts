import { fail, error } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { validateForm } from '$lib/server/utils/forms';
import type { Actions, PageServerLoad } from './$types';

const moderationSchema = z.object({
	answerId: z.string().min(1),
	action: z.enum(['approved', 'rejected'])
});

export const load: PageServerLoad = async ({ params }) => {
	const [answer] = await moderation.getAnswer(params.slug);
	if (!answer) error(404, 'Antwoord niet gevonden');
	return {answer: answer}
};

export const actions = {
	default: async ({ request, locals, url, cookies }) => {
		const result = await validateForm(request, moderationSchema);
		if (!result.valid || !locals.user) return fail(400, { error: 'Ongeldige aanvraag.' });

		const outcome = await moderation.moderateAnswer({
			answerId: result.data.answerId,
			moderatorId: locals.user.id,
			action: result.data.action
		});

		if ('error' in outcome) return fail(409, { error: 'Dit antwoord is al behandeld.' });

		const message = result.data.action == 'approved' ? 
			'Je hebt het antwoord goedgekeurd' :
			'Je hebt het antwoord afgewezen';
	  const flashType = result.data.action == 'approved' ? 'success' : 'neutral'
		const returnTo = url.searchParams.get('returnTo');
		if (returnTo) {
			return redirect(returnTo, {type: flashType, message}, cookies);
		}

		return { moderated: result.data.answerId };
	}
} satisfies Actions;
