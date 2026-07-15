import { error } from '@sveltejs/kit';
import { INBOUND_MAIL_TOKEN } from '$env/static/private';
import { safeEquals, validateForm } from '$lib/server/utils/forms';
import { inboundEmailSchema } from '$lib/server/email/parse-inbound';
import { receiveInboundEmail } from '$lib/server/email/inbox';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	if (!safeEquals(url.searchParams.get('token') ?? '', INBOUND_MAIL_TOKEN))
		error(401, 'Ongeldig token');

	const form = await validateForm(request, inboundEmailSchema);

	if (!form.valid) {
		console.warn('[sendgrid/inbound] ongeldige email ontvangen', form.data, form.issues);
		return new Response('ok');
	}

	await receiveInboundEmail(form.data);

	return new Response('ok');
};
