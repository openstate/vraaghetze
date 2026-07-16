import { describe, expect, test } from 'vitest';
import {
	dedupKey,
	extractAddress,
	extractReplyText,
	extractToken,
	inboundEmailSchema,
	isAutoReply,
	isSenderVerified,
	type InboundEmail
} from './parse-inbound';

function makeEmail(overrides: Partial<InboundEmail> = {}): InboundEmail {
	return {
		headers: 'From: Jan Jansen <j.jansen@tweedekamer.nl>',
		dkim: '{@tweedekamer.nl : pass}',
		SPF: 'pass',
		to: 'antwoord+3f2a9b@vraaghetze.nu',
		from: 'Jan Jansen <j.jansen@tweedekamer.nl>',
		subject: 'Re: Uw vraag',
		text: 'Mijn antwoord.',
		sender_ip: '127.0.0.1',
		envelope: { from: 'j.jansen@tweedekamer.nl', to: ['antwoord+3f2a9b@vraaghetze.nu'] },
		charsets: {},
		...overrides
	};
}

describe('extractAddress', () => {
	test('extracts the address from a bracketed From header', () => {
		expect(extractAddress('Jan Jansen <J.Jansen@Tweedekamer.nl>')).toBe('j.jansen@tweedekamer.nl');
	});

	test('lowercases and trims a bare address', () => {
		expect(extractAddress('  J.Jansen@Tweedekamer.NL ')).toBe('j.jansen@tweedekamer.nl');
	});
});

describe('extractToken', () => {
	test('finds the token in the envelope recipients', () => {
		const uuid = '5413e1b9-2f2c-46ce-a28e-78bd61104477';
		const to = `antwoord+${uuid}@vraaghetze.nu`;

		expect(extractToken([to], to)).toBe(uuid);
	});

	test('scans all recipients in the envelope', () => {
		expect(
			extractToken(['iemand@anders.nl', 'antwoord+00ff@vraaghetze.nu'], 'iemand@anders.nl')
		).toBe('00ff');
	});

	test('falls back to the to-header, ignoring case and display names', () => {
		expect(extractToken(['bounce@relay.nl'], '"VraagHetZe" <ANTWOORD+ABC123@vraaghetze.nu>')).toBe(
			'abc123'
		);
	});

	test('scans all comma-separated recipients in the to-header', () => {
		expect(extractToken([], 'iemand@anders.nl, antwoord+00ff@vraaghetze.nu')).toBe('00ff');
	});

	test('returns null when no answer address is present', () => {
		expect(extractToken(['info@vraaghetze.nu'], 'info@vraaghetze.nu')).toBeNull();
	});
});

describe('dedupKey', () => {
	test('is stable for identical emails', () => {
		expect(dedupKey(makeEmail())).toBe(dedupKey(makeEmail()));
	});

	test('changes when the body changes', () => {
		expect(dedupKey(makeEmail())).not.toBe(dedupKey(makeEmail({ text: 'Ander antwoord.' })));
	});
});

describe('isAutoReply', () => {
	test.each([
		'Subject: Afwezig\nAuto-Submitted: auto-replied',
		'X-Autoreply: yes',
		'X-Autorespond: vacation',
		'Precedence: bulk',
		'Precedence: junk',
		'Precedence: auto_reply',
		'Received: relay\nPrecedence: bulk\nSubject: Afwezig'
	])('flags %j as an auto-reply', (headers) => {
		expect(isAutoReply(headers)).toBe(true);
	});

	test.each([
		'Auto-Submitted: no',
		'Precedence: first-class',
		'From: jan@tweedekamer.nl\nSubject: Re: Uw vraag'
	])('does not flag %j', (headers) => {
		expect(isAutoReply(headers)).toBe(false);
	});
});

describe('extractReplyText', () => {
	test('returns plain text trimmed', () => {
		expect(extractReplyText('  Mijn antwoord.\n')).toBe('Mijn antwoord.');
	});

	test('returns an empty string for undefined or whitespace-only text', () => {
		expect(extractReplyText(undefined)).toBe('');
		expect(extractReplyText('  \n \n')).toBe('');
	});

	test('strips original-message blocks', () => {
		const text =
			'Hierbij mijn antwoord.\n\n-----Oorspronkelijk bericht-----\nVan: VraagHetZe <antwoord+3f2a@vraaghetze.nu>\nOnderwerp: Uw vraag';

		expect(extractReplyText(text)).toBe('Hierbij mijn antwoord.');
	});

	test('strips quoted reply blocks', () => {
		const text =
			'Mijn antwoord.\n\nOp ma 13 jul 2026 om 10:00 schreef VraagHetZe <antwoord+3f2a@vraaghetze.nu>:\n> Kunt u deze vraag beantwoorden?\n> Alvast bedankt.';

		expect(extractReplyText(text)).toBe('Mijn antwoord.');
	});
});

describe('isSenderVerified', () => {
	test.each([
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@tweedekamer.nl : pass}' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@Tweedekamer.NL : PASS}' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@sendgrid.net : fail},{@tweedekamer.nl : pass}' }
	])('verifies $from with dkim $dkim', ({ from, dkim }) => {
		expect(isSenderVerified(makeEmail({ from, dkim }))).toBe(true);
	});

	test.each([
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@tweedekamer.nl : fail}' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@sendgrid.net : pass}' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@evil-tweedekamer.nl : pass}' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@evil.tweedekamer.nl : pass}' },
		{ from: 'Jan <jan@evil.tweedekamer.nl>', dkim: '{@tweedekamer.nl : pass}' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '{@sendgrid.net : pass},{@tweedekamer.nl : fail}' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: 'none' },
		{ from: 'Jan <jan@tweedekamer.nl>', dkim: '' },
		{ from: 'onzin-zonder-apenstaart', dkim: '{@tweedekamer.nl : pass}' }
	])('rejects $from with dkim $dkim', ({ from, dkim }) => {
		expect(isSenderVerified(makeEmail({ from, dkim }))).toBe(false);
	});
});

describe('inboundEmailSchema', () => {
	const validPayload = {
		headers: 'From: Jan Jansen <j.jansen@tweedekamer.nl>',
		dkim: '{@tweedekamer.nl : pass}',
		SPF: 'pass',
		to: 'antwoord+3f2a9b@vraaghetze.nu',
		from: 'Jan Jansen <j.jansen@tweedekamer.nl>',
		subject: 'Re: Uw vraag',
		text: 'Mijn antwoord.',
		sender_ip: '127.0.0.1',
		envelope: JSON.stringify({
			from: 'j.jansen@tweedekamer.nl',
			to: ['antwoord+3f2a9b@vraaghetze.nu']
		}),
		charsets: JSON.stringify({ to: 'UTF-8', subject: 'UTF-8' }),
		spam_score: '0.011',
		attachments: '0'
	};

	test('parses a SendGrid form payload and decodes nested JSON fields', () => {
		const result = inboundEmailSchema.safeParse(validPayload);

		expect(result.success).toBe(true);
		expect(result.data?.to).toBe('antwoord+3f2a9b@vraaghetze.nu');
		expect(result.data?.envelope).toEqual({
			from: 'j.jansen@tweedekamer.nl',
			to: ['antwoord+3f2a9b@vraaghetze.nu']
		});
	});

	test('rejects payloads with malformed envelope JSON', () => {
		const result = inboundEmailSchema.safeParse({ ...validPayload, envelope: 'geen json' });

		expect(result.success).toBe(false);
	});
});
