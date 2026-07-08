import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as questions from '$lib/server/questions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const viewerId = locals.user?.id ?? null;

	const result = await questions.bySlug(params.slug, viewerId);
	if (!result) error(404, 'Vraag niet gevonden');

	const needsConfirm = viewerId ? await questions.pendingConfirmation(params.slug, viewerId) : null;

	const banner = needsConfirm
		? 'needs-confirm'
		: needsConfirm === false && url.searchParams.get('doel') === 'bevestigen'
			? 'verified'
			: null;

	return { ...result, banner };
};

const choiceSchema = z.object({ keuze: z.enum(['ja', 'nee']) });

export const actions = {
	bevestigen: async ({ params, locals, request }) => {
		if (!locals.user) error(401, 'Log in om je vraag te bevestigen.');

		const parsed = choiceSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { error: true });

		if (parsed.data.keuze === 'nee') {
			await questions.disownQuestion(params.slug, locals.user.id);
			redirect(303, '/');
		}

		await questions.claimQuestion(params.slug, locals.user.id);
		return { confirmed: true };
	}
} satisfies Actions;
