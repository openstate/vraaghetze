import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as follows from '$lib/server/follows';
import * as questions from '$lib/server/questions';
import { sendSignInLink } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const RELATED_QUESTIONS = 3;

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const viewerId = locals.user?.id ?? null;

	const result = await questions.bySlug(params.slug, viewerId, locals.user?.role == 'admin');
	if (!result) error(404, 'Vraag niet gevonden');

	const needsConfirm = viewerId ? await questions.pendingConfirmation(params.slug, viewerId) : null;
	const { followers, isFollowing } = await follows.countForQuestion(result.question.id, viewerId);

	const banner =
		// matches if the visitor still has to confirm they asked this question
		needsConfirm
			? 'needs-confirm'
			: // matches if they just confirmed it through the link in their mail
				needsConfirm === false && url.searchParams.get('doel') === 'bevestigen'
				? 'verified'
				: // matches if they came back from the follow mail but have not pressed the bell yet
					url.searchParams.get('doel') === 'volgen' && !isFollowing
					? 'follow'
					: null;

	return {
		...result,
		followers,
		isFollowing,
		related: await questions.relatedTo(params.slug, RELATED_QUESTIONS),
		banner,
		meta: { title: result.question.title }
	};
};

const choiceSchema = z.object({ keuze: z.enum(['ja', 'nee']) });

const followSchema = z.object({ email: z.email() });

export const actions = {
	bevestigen: async ({ params, locals, request }) => {
		if (!locals.user) error(401, 'Log in om je vraag te bevestigen.');

		const parsed = choiceSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { error: true });

		if (parsed.data.keuze === 'nee') {
			const disowned = await questions.disownQuestion(params.slug, locals.user.id);
			if (!disowned) error(404, 'Vraag niet gevonden');
			redirect(303, '/');
		}

		const claimed = await questions.claimQuestion(params.slug, locals.user.id);
		if (!claimed) error(404, 'Vraag niet gevonden');

		return { confirmed: true };
	},
	volgen: async ({ params, locals, request, url }) => {
		// signed-in visitors follow right away, the rest verify their e-mail address first
		if (locals.user) {
			const followed = await follows.follow(params.slug, locals.user.id);

			if ('error' in followed) {
				if (followed.error === 'unknown-question') error(404, 'Vraag niet gevonden');

				return fail(400, {
					error:
						followed.error === 'own-question'
							? 'Je krijgt automatisch bericht zodra je eigen vraag beantwoord is.'
							: 'Deze vraag is al beantwoord.'
				});
			}

			return { followed: true };
		}

		const parsed = followSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { error: 'Vul een geldig e-mailadres in.' });

		const callback = new URL(`/vragen/${params.slug}`, url.origin);
		callback.searchParams.set('doel', 'volgen');
		await sendSignInLink(parsed.data.email, callback.toString());

		// the same answer for every address, so the dialog can't be used to find accounts
		return { email: parsed.data.email };
	},

	ontvolgen: async ({ params, locals }) => {
		if (!locals.user) error(401, 'Log in om deze vraag niet meer te volgen.');

		await follows.unfollow(params.slug, locals.user.id);

		return { unfollowed: true };
	}
} satisfies Actions;
