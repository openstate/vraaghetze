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
		questionId: z.string().min(1),
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

		const selectedPoliticianSlug = ("selectedPoliticianSlug" in result.data) ? result.data.selectedPoliticianSlug: 'non-existing-slug';
		const selectedPolitician = await politicians.bySlug(selectedPoliticianSlug);

		// Check that politician exists and accepts questions
		if (!selectedPolitician) {
			return fail(400, { error: 'Kamerlid bestaat niet.' })
		}
		if (!selectedPolitician.acceptsQuestions) {
			return fail(400, { error: 'Dit Kamerlid heeft ervoor gekozen niet openbaar antwoord te geven via VraagHetZe.' })
		}

		const changed = await moderation.moderatedPoliticianChange({
			questionId: result.data.questionId,
			moderatorId: locals.user.id,
			selectedPolitician,
			sendEmail: result.data.sendEmail
		});

		if (changed.error) {
			return fail(400, { error: changed.error })
		}

		const base = `Kamerlid is aangepast naar ${selectedPoliticianSlug}`;
		let message: string;
		if (result.data.sendEmail){
			message = `${base} en de vraag is gemaild naar het nieuwe Kamerlid.`
		} else {
			message = `${base}.`
		}
		setFlash({ type: 'neutral', message }, cookies);
		return { moderated: result.data.questionId };
	}
} satisfies Actions;
