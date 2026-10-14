import { z } from 'zod';
import * as moderation from '$lib/server/moderation';
import { parsePagination } from '$lib/pagination';
import type { PageServerLoad } from './$types';
import { validateForm } from '$lib/server/utils/forms';
import { processMail } from '$lib/server/email/inbox';
import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';

const editInboxSchema = z.object({
	inboxId: z.string().min(1),
	returnTo: z.string().min(1),
	action: z.union([z.literal('process_anyway'), z.literal('ignore')])
});

export const load: PageServerLoad = async ({ parent, url }) => {
	const parentData = await parent();
	const inboxStatusSelect = parentData.query.inboxStatusSelect;
	const pagination = parsePagination(url);
	const inbox = await moderation.listInbox(pagination, inboxStatusSelect);
	return { ...inbox, ...pagination };
};

export const actions = {
	// When a mail is received from a non-expected email address, the moderator can decide to process
	// the mail anyway. This default action handles that decision:
	// - the mail is processed and an answer is created
	// - the moderator is redirected to the answer page for approving the answer and will
	//   be returned afterwards to the original page
	default: async ({ request, cookies }) => {
		const result = await validateForm(request, editInboxSchema);
		if (!result.valid) return;

		const mail = await moderation.getInboxMail(result.data.inboxId);

		if (result.data.action == 'process_anyway') {
			const answerId = await processMail(mail, ['wrong_sender']);
			if (answerId) {
				const url =
					resolve('/modereren/antwoorden/[slug]', { slug: answerId }) +
					`?returnTo=${result.data.returnTo}`;
				redirect(303, url);
			}
		} else {
			await processMail(mail, [], { status: 'ignored', reason: 'Handmatig genegeerd na status ignored_different_sender'});
			const message = `De mail van verkeerde afzender ${mail.fromAddress} wordt definitief genegeerd.`
			setFlash({ type: 'neutral', message: message }, cookies);
		}
	}
};
