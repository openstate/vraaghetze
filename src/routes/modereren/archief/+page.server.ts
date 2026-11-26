import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { parsePagination } from '$lib/pagination';
import { validateForm } from '$lib/server/utils/forms';
import type { Actions, PageServerLoad } from './$types';
import * as politicians from '$lib/server/politicians';
import { setFlash } from 'sveltekit-flash-message/server';

const moderationSchema = z.discriminatedUnion('action', [
	z.object({
		action: z.literal('change-politician'),
		questionSlug: z.string().min(1),
		selectedPoliticianSlug: z.string().min(1),
		sendEmail: z.coerce.boolean().default(false)
	}),
]);

export const load: PageServerLoad = async ({ parent, url }) => {
	const parentData = await parent();
	const archiveStatusSelect = parentData.query.archiveStatusSelect;
	const pagination = parsePagination(url);
	const questions = await moderation.listQuestions(pagination, archiveStatusSelect);
	const politiciansAndCommissions = await politicians.listActiveWithCommissions();

	return { ...questions, ...pagination, ...politiciansAndCommissions };
};

export const actions = {
	default: async ({ request, locals, cookies }) => {
		const result = await validateForm(request, moderationSchema);
		if (!result.valid || !locals.user) return fail(400, { error: 'Ongeldige aanvraag.' });

		const changed = await moderation.moderatedPoliticianChange({
			questionSlug: result.data.questionSlug,
			selectedPoliticianSlug: result.data.selectedPoliticianSlug,
			moderatorId: locals.user.id,
			sendEmail: result.data.sendEmail
		});

		if (changed.error) return fail(400, { error: changed.error })

		setFlash({ type: 'neutral', message: changed.message ?? '' }, cookies);
		return { moderated: result.data.questionSlug };
	}
} satisfies Actions;
