import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { validateForm } from '$lib/server/utils/forms';
import type { Actions, PageServerLoad } from './$types';

const moderationSchema = z.object({
	answerId: z.string().min(1),
	action: z.enum(['approved', 'rejected'])
});

export const load: PageServerLoad = async () => {
	return { queue: await moderation.listAnswerQueue() };
};

export const actions = {
	default: async ({ request, locals }) => {
		const result = await validateForm(request, moderationSchema);
		if (!result.valid || !locals.user) return fail(400, { error: 'Ongeldige aanvraag.' });

		const outcome = await moderation.moderateAnswer({
			answerId: result.data.answerId,
			moderatorId: locals.user.id,
			action: result.data.action
		});

		if ('error' in outcome) return fail(409, { error: 'Dit antwoord is al behandeld.' });
		return { moderated: result.data.answerId };
	}
} satisfies Actions;
