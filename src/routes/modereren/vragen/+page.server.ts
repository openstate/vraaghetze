import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { validateForm } from '$lib/server/utils/forms';
import type { Actions, PageServerLoad } from './$types';
import { rejectionKeys, type rejectionKeyType } from '$lib/moderation';
import * as politicians from '$lib/server/politicians';

const moderationSchema = z.discriminatedUnion('action', [
	z.object({
		questionId: z.string().min(1),
		action: z.literal('approved'),
		note: z.string().trim().optional()
	}),
	z.object({
		questionId: z.string().min(1),
		action: z.literal('rejected'),
		rejectionReason: z
			.string()
			.trim()
			.nonempty()
			.refine((str) => {
				const reasons = str.split(',') as rejectionKeyType[];
				for (const reason of reasons) {
					if (!rejectionKeys.includes(reason)) return false;
				}
				return true;
			}),
		note: z.string().trim().optional()
	}),
	z.object({
		questionId: z.string().min(1),
		action: z.literal('note-added'),
		note: z.string().trim()
	}),
	z.object({
		questionId: z.string().min(1),
		proposedPoliticianSlug: z.string().min(1),
		action: z.literal('pending-wrong-politician')
	}),
]);

export const load: PageServerLoad = async () => {
	const queue = await moderation.listQuestionQueue();
	const politiciansAndCommissions = await politicians.listActiveWithCommissions();
	return { ...politiciansAndCommissions, queue };
};

export const actions = {
	default: async ({ request, locals }) => {
		const result = await validateForm(request, moderationSchema);
		if (!result.valid || !locals.user) return fail(400, { error: 'Ongeldige aanvraag.' });

		const note = ("note" in result.data) ? result.data.note: undefined;
		const rejectionReason = ("rejectionReason" in result.data) ? result.data.rejectionReason: '';
		const proposedPoliticianSlug = ("proposedPoliticianSlug" in result.data) ? result.data.proposedPoliticianSlug: undefined;
		let proposedPolitician: politicians.PoliticianType | undefined = undefined;

		if (result.data.action === 'pending-wrong-politician' && proposedPoliticianSlug) {
			proposedPolitician = await politicians.bySlug(proposedPoliticianSlug);
			// Check that politician exists and accepts questions
			if (!proposedPolitician) {
				return fail(400, { error: 'Kamerlid bestaat niet.' })
			}
			if (!proposedPolitician.acceptsQuestions) {
				return fail(400, { error: 'Dit Kamerlid heeft ervoor gekozen niet openbaar antwoord te geven via VraagHetZe.' })
			}
		}

		const outcome = await moderation.moderateQuestion({
			questionId: result.data.questionId,
			moderatorId: locals.user.id,
			action: result.data.action,
			note: note,
			proposedPolitician: proposedPolitician,
			rejectionReason: rejectionReason
		});

		if ('error' in outcome)
			return fail(409, {
				error:
					outcome.error === 'not-verified'
						? 'Deze vraag is nog niet bevestigd door de vraagsteller.'
						: outcome.error === 'already-handled'
							? 'Deze vraag is al behandeld.'
							: 'Er is een onbekende fout opgetreden.'
			});
		return { moderated: result.data.questionId };
	}
} satisfies Actions;
