import { error } from '@sveltejs/kit';
import { INBOUND_MAIL_TOKEN } from '$env/static/private';
import { z } from 'zod';
import { jsonString, safeEquals, validateForm } from '$lib/server/forms';
import type { RequestHandler } from './$types';

// https://www.twilio.com/docs/sendgrid/for-developers/parsing-email/setting-up-the-inbound-parse-webhook
const inboundEmailSchema = z.object({
	headers: z.string(),
	dkim: z.string(),
	SPF: z.string(),
	to: z.string(),
	from: z.string(),
	cc: z.string().optional(),
	subject: z.string().optional(),
	text: z.string().optional(),
	html: z.string().optional(),
	sender_ip: z.string(),
	envelope: jsonString(z.object({ from: z.string(), to: z.array(z.string()) })),
	charsets: jsonString(z.record(z.string(), z.string())),
	spam_score: z.coerce.number().optional(),
	spam_report: z.string().optional(),
	attachments: z.coerce.number().optional(),
	email: z.string().optional()
});

export type InboundEmail = z.output<typeof inboundEmailSchema>;

const isSenderVerified = (email: InboundEmail) => {
	const fromDomain = /@([^\s>]+)>?\s*$/.exec(email.from.trim())?.[1].toLowerCase();
	if (!fromDomain) return false;
	return [...email.dkim.matchAll(/@([^\s:{}]+)\s*:\s*(\w+)/g)].some(([, domain, result]) => {
		const signer = domain.toLowerCase();
		const aligned =
			signer === fromDomain ||
			signer.endsWith(`.${fromDomain}`) ||
			fromDomain.endsWith(`.${signer}`);
		return aligned && result.toLowerCase() === 'pass';
	});
};

export const POST: RequestHandler = async ({ request, url }) => {
	if (!safeEquals(url.searchParams.get('token') ?? '', INBOUND_MAIL_TOKEN))
		error(401, 'Ongeldig token');

	const form = await validateForm(request, inboundEmailSchema);

	if (!form.valid) {
		console.warn('[sendgrid/inbound] ongeldige email ontvangen', form.data, form.issues);
	} else if (isSenderVerified(form.data)) {
		console.log('[sendgrid/inbound] geverifieerde email ontvangen', form.data);
	} else {
		console.warn('[sendgrid/inbound] ongeverifieerde email', form.data);
	}

	return new Response('ok');
};
