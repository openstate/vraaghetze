import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as politicians from '$lib/server/politicians';
import * as questions from '$lib/server/questions';
import { sendSignInLink } from '$lib/server/auth';
import { validateForm, type FormIssues } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	name: z.string().trim().min(1, 'Vul je volledige naam in.'),
	email: z.string().trim().toLowerCase().pipe(z.email('Vul een geldig e-mailadres in.')),
	title: z.string().trim().min(1, 'Stel je vraag.'),
	body: z.string().trim().default(''),
	politicianId: z.string().min(1, 'Kies een Kamerlid.')
});

export const load: PageServerLoad = async () => ({
	politicians: await politicians.listActive()
});

export const actions = {
	default: async ({ request, locals, url }) => {
		const result = await validateForm(request, schema);
		if (!result.valid) return fail(400, { issues: result.issues });

		const currentUserId = locals.user?.id ?? null;
		const slug = await questions.create({ ...result.data, currentUserId });

		if (!slug) {
			const issues: FormIssues<typeof schema> = {
				politicianId: ['Dit Kamerlid bestaat niet of is niet langer actief.']
			};
			return fail(400, { issues });
		}

		if (!currentUserId) {
			await sendSignInLink(result.data.email, `${url.origin}/vragen/${slug}`);

			return { email: result.data.email };
		}

		redirect(303, `/vragen/${slug}`);
	}
} satisfies Actions;
