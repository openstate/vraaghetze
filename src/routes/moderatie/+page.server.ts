import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { validateForm } from '$lib/server/forms';
import { hasPermission } from '$lib/permissions';
import type { Actions, PageServerLoad } from './$types';

const moderationSchema = z.object({
	questionId: z.string().min(1),
	action: z.enum(['approved', 'rejected']),
	note: z.string().trim().optional()
});

function authorizeModerator(user: App.Locals['user']) {
	if (!user) redirect(307, '/inloggen');
	if (!hasPermission(user, { question: ['moderate'] })) error(403, 'Geen toegang');
	return user;
}

export const load: PageServerLoad = async ({ locals }) => {
	authorizeModerator(locals.user);
	return { queue: await moderation.listQueue() };
};

export const actions = {
	default: async ({ request, locals }) => {
		const moderator = authorizeModerator(locals.user);

		const result = await validateForm(request, moderationSchema);
		if (!result.valid) return fail(400, { error: 'Ongeldige aanvraag.' });

		const outcome = await moderation.moderate({
			questionId: result.data.questionId,
			moderatorId: moderator.id,
			action: result.data.action,
			note: result.data.note || undefined
		});

		if ('error' in outcome) return fail(409, { error: 'Deze vraag is al behandeld.' });
		return { moderated: result.data.questionId };
	}
} satisfies Actions;
