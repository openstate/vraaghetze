import { createHash } from 'node:crypto';
import { z } from 'zod';
import EmailReplyParser from 'email-reply-parser';
import { jsonString } from '$lib/server/utils/forms';

// https://www.twilio.com/docs/sendgrid/for-developers/parsing-email/setting-up-the-inbound-parse-webhook
export const inboundEmailSchema = z.object({
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

const answerAddressPattern = /^antwoord\+([a-f0-9-]+)@/i;

export function extractToken(envelopeTo: string[], toHeader: string) {
	const candidates = [...envelopeTo, ...toHeader.split(',')].map(extractAddress);
	for (const candidate of candidates) {
		const match = answerAddressPattern.exec(candidate);
		if (match) return match[1].toLowerCase();
	}
	return null;
}

export function extractAddress(from: string) {
	const bracketed = /<([^<>]+)>/.exec(from);
	return (bracketed?.[1] ?? from).trim().toLowerCase();
}

export function dedupKey(email: InboundEmail) {
	const fingerprint = [email.from, email.to, email.subject ?? '', email.text ?? ''];
	return `sha256:${createHash('sha256').update(fingerprint.join('\n')).digest('hex')}`;
}

export function isAutoReply(headers: string) {
	return (
		/^auto-submitted:\s*(?!no\b)/im.test(headers) ||
		/^x-auto(?:reply|respond)\b/im.test(headers) ||
		/^precedence:\s*(?:auto_reply|bulk|junk)\b/im.test(headers)
	);
}

const emailReplyParser = new EmailReplyParser();

export function extractReplyText(text: string | undefined) {
	const cutIndex = text?.search(/^-+ ?Oorspronkelijk bericht ?-+$/im); // not in parsers default
	const ownText = cutIndex === -1 ? text : text?.slice(0, cutIndex);
	return emailReplyParser
		.read(ownText || '')
		.getVisibleText()
		.trim();
}

// DKIM alignment, strict on purpose: at least one signature must pass AND be placed
// by exactly the From domain.
export function isSenderVerified(email: InboundEmail) {
	const fromDomain = /@([^@]+)$/.exec(extractAddress(email.from))?.[1];
	if (!fromDomain) return false;

	const dkimDomains = [...email.dkim.matchAll(/@([^\s:{}]+)\s*:\s*(\w+)/g)];

	return dkimDomains.some(
		([, domain, result]) =>
			domain.toLowerCase() === fromDomain.toLowerCase() && result.toLowerCase() === 'pass'
	);
}
