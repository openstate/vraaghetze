import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as politicians from '$lib/server/politicians';
import * as questions from '$lib/server/questions';
import { sendSignInLink } from '$lib/server/auth';
import { validateForm, type FormIssues } from '$lib/server/forms';
import { hasPermission } from '$lib/permissions';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	name: z.string().trim().min(1, 'Vul je volledige naam in.'),
	email: z.string().trim().toLowerCase().pipe(z.email('Vul een geldig e-mailadres in.')),
	title: z.string().trim().min(1, 'Stel je vraag.'),
	body: z.string().trim().default(''),
	politicianId: z.string().min(1, 'Kies een Kamerlid.')
});

export const load: PageServerLoad = async ({ locals }) => ({
	politicians: await politicians.listActive(),
	mayAsk: hasPermission(locals.user, { question: ['ask'] })
});

export const actions = {
	default: async ({ request, locals, url }) => {
		const result = await validateForm(request, schema);
		if (!result.valid) return fail(400, { issues: result.issues });

		if (!hasPermission(locals.user, { question: ['ask'] }))
			return fail(403, { error: 'Met dit account kun je geen vragen stellen.' });

		const currentUserId = locals.user?.id ?? null;
		const created = await questions.create({ ...result.data, currentUserId });

		if ('error' in created) {
			if (created.error === 'unknown-politician') {
				return fail(400, {
					issues: {
						politicianId: ['Dit Kamerlid bestaat niet of is niet langer actief.']
					} as FormIssues<typeof schema>
				});
			}

			// email may not ask questions, respond as if mail was sent to avoid making moderators public
			return { email: result.data.email };
		}

		if (!currentUserId) {
			const callback = new URL(`/vragen/${created.slug}`, url.origin);
			callback.searchParams.set('doel', 'bevestigen');
			await sendSignInLink(result.data.email, callback.toString());

			return { email: result.data.email };
		}

		redirect(303, `/vragen/${created.slug}`);
	}
} satisfies Actions;
