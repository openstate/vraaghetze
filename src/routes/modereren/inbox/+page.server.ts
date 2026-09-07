import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { parsePagination } from '$lib/pagination';
import type { PageServerLoad } from './$types';
import { validateForm } from '$lib/server/utils/forms';
import { processMail } from '$lib/server/email/inbox';
import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

const editInboxSchema = z.object({
	inboxId: z.string().min(1),
	returnTo: z.string().min(1),
	action: z.literal('process_anyway')
});

export const load: PageServerLoad = async ({ url }) => {
	const pagination = parsePagination(url);
	const inbox = await moderation.listInbox(pagination);
	return { ...inbox, ...pagination };
};


export const actions = {
// When a mail is received from a non-expected email address, the moderator can decide to process
// the mail anyway. This default action handles that decision:
// - the mail is processed and an answer is created
// - the moderator is redirected to the answer page for approving the answer and will
//   be returned afterwards to the original page
	default: async ({ request }) => {
		const result = await validateForm(request, editInboxSchema);
		if (!result.valid) return

		const mail = await moderation.getInboxMail(result.data.inboxId);
		const answerId = await processMail(mail, ['wrong_sender'])

		if (answerId){
			const url = resolve('/modereren/antwoorden/[slug]', {slug: answerId}) + `?returnTo=${result.data.returnTo}`;
			redirect(303, url)
		}
	}
}