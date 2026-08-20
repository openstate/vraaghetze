import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { validateForm } from '$lib/server/utils/forms';
import type { Actions, PageServerLoad } from './$types';

const moderationSchema = z.object({
	questionId: z.string().min(1),
	action: z.enum(['approved', 'rejected']),
	rejectionReason: z.string().trim().optional(),
	note: z.string().trim().optional()
});

export const load: PageServerLoad = async () => {
	return { queue: await moderation.listQuestionQueue() };
};

export const actions = {
	default: async ({ request, locals }) => {
		const result = await validateForm(request, moderationSchema);
		if (!result.valid || !locals.user) return fail(400, { error: 'Ongeldige aanvraag.' });

		const outcome = await moderation.moderateQuestion({
			questionId: result.data.questionId,
			moderatorId: locals.user.id,
			action: result.data.action,
			note: result.data.note || undefined,
			rejectionReason: result.data.rejectionReason
		});

		if ('error' in outcome)
			return fail(409, {
				error:
					outcome.error === 'not-verified'
						? 'Deze vraag is nog niet bevestigd door de vraagsteller.'
						: 'Deze vraag is al behandeld.'
			});
		return { moderated: result.data.questionId };
	}
} satisfies Actions;
