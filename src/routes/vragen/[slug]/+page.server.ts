import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as follows from '$lib/server/follows';
import * as questions from '$lib/server/questions';
import * as politicians from '$lib/server/politicians';
import type { Actions, PageServerLoad } from './$types';
import { automatedPoliticianChange, getProposedPoliticianModerationAction } from '$lib/server/moderation';
import type { UserType } from '$lib/server/auth';
import type { schema } from '$lib/server/db';

const RELATED_QUESTIONS = 3;

type getPoliticianChangeInfoType = {
	user?: UserType;
	slug: string;
}

type getPoliticianChangeInfoReturnType = {
	user?: UserType;
	question?: questions.QuestionType;
	currentPolitician?: politicians.PoliticianType;
	moderationAction?: typeof schema.moderationAction.$inferSelect;
	proposedPolitician?: politicians.PoliticianType;
}

const getPoliticianChangeInfo = async ({ user, slug }: getPoliticianChangeInfoType): Promise<getPoliticianChangeInfoReturnType> => {
	if (!user) return {};
	const viewerId = user?.id ?? null;

	const result = await questions.bySlug(slug, viewerId);
	if (!result.question || result.question.status !== 'pending-wrong-politician') return { user };
	const question = result.question;

	const currentPolitician = await politicians.bySlug(question.assigneeSlug);

	const moderationAction = await getProposedPoliticianModerationAction(question);
	if (!moderationAction) return { user, question, currentPolitician };

	const proposedPolitician = await politicians.bySlug(moderationAction.meta?.proposedPoliticianSlug ?? '');
	
	return { user, question, currentPolitician, moderationAction, proposedPolitician };
};

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const viewerId = locals.user?.id ?? null;

	const result = await questions.bySlug(params.slug, viewerId);
	if (!result.question) error(404, 'Vraag niet gevonden');

	let acceptPoliticianChange = url.searchParams.get('doel') === 'kamerlid_wijzigen';
	let proposedPoliticianName: string | undefined = undefined;
	if (acceptPoliticianChange) {
		const { user, question, currentPolitician, moderationAction, proposedPolitician } = await getPoliticianChangeInfo({ user: locals.user, slug: params.slug });
		if (!user || !question || !currentPolitician || !moderationAction || !proposedPolitician) acceptPoliticianChange = false;
		proposedPoliticianName = proposedPolitician?.name
	}
	const needsConfirm = viewerId ? await questions.pendingConfirmation(params.slug, viewerId) : null;
	const { followers, isFollowing } = await follows.countForQuestion(result.question.id, viewerId);

	const banner =
		// matches if the user has to confirm a politician change 
		acceptPoliticianChange
		? 'accept-politician-change'
		: // matches if the visitor still has to confirm they asked this question
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
		proposedPoliticianName: proposedPoliticianName,
		meta: { title: result.question.title }
	};
};

const choiceSchema = z.object({ keuze: z.enum(['ja', 'nee']) });

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
	volgen: async ({ params, locals }) => {
		if (!locals.user) error(401, 'Log in om deze vraag te volgen.');

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
	},
	ontvolgen: async ({ params, locals }) => {
		if (!locals.user) error(401, 'Log in om deze vraag niet meer te volgen.');

		await follows.unfollow(params.slug, locals.user.id);

		return { unfollowed: true };
	},
	kamerlid_wijzigen: async ({ params, locals, request }) => {
		const { user, question, currentPolitician, moderationAction, proposedPolitician } = await getPoliticianChangeInfo({ user: locals.user, slug: params.slug });
		if (!user) error(401, 'Log in om het Kamerlid te wijzigen.');
		if (!question) error(404, 'Vraag niet gevonden');
		if (!currentPolitician) error(404, 'Kamerlid niet gevonden');
		if (!moderationAction) error(404, 'Vraagvoorstel niet gevonden');
		if (!proposedPolitician) error(404, 'Voorgesteld Kamerlid niet gevonden');
		if (!proposedPolitician.acceptsQuestions) {
			return fail(400, { error: 'Dit Kamerlid heeft ervoor gekozen niet openbaar antwoord te geven via VraagHetZe.' })
		}

		const parsed = choiceSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { error: 'Er is een onbekende fout opgetreden.' });

		const accepted = parsed.data.keuze === 'ja';
		// To moderate this question, we use the moderator that proposed the politician
		await automatedPoliticianChange({ accepted, question, moderationAction, currentPolitician, proposedPolitician })
		return { politician_changed: accepted };
  }
} satisfies Actions;
