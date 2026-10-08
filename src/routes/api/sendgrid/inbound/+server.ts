import { error } from '@sveltejs/kit';
import { INBOUND_MAIL_TOKEN } from '$env/static/private';
import { safeEquals, validateForm } from '$lib/server/utils/forms';
import { inboundEmailSchema } from '$lib/server/email/parse-inbound';
import { checkEncodings, receiveInboundEmail } from '$lib/server/email/inbox';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	if (!safeEquals(url.searchParams.get('token') ?? '', INBOUND_MAIL_TOKEN))
		error(401, 'Ongeldig token');

	const clonedRequest = request.clone();
	const form = await validateForm(request, inboundEmailSchema);

	if (!form.valid) {
		console.warn('[sendgrid/inbound] ongeldige email ontvangen', form.data, form.issues);
		return new Response('ok');
	}

	const rawData = form.data;
	const bodyBytes = await clonedRequest.bytes();
	await checkEncodings({ rawData, contentType: request.headers.get('content-type') || '', bodyBytes });

	await receiveInboundEmail(rawData, bodyBytes);

	return new Response('ok');
};
