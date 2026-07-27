import { beforeEach, describe, expect, test, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as endpoint from './+server';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	EMAIL_INBOX: 'inbox@test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));
vi.mock('$env/static/private', () => ({ INBOUND_MAIL_TOKEN: 'test-webhook-token' }));

function makePayload(sender: string): Record<string, string> {
	return {
		headers: `From: Jan Jansen <${sender}>`,
		dkim: '{@test.example : pass}',
		SPF: 'pass',
		to: 'info@test.example',
		from: `Jan Jansen <${sender}>`,
		subject: 'Re: Uw vraag',
		text: 'Mijn antwoord op uw vraag.',
		sender_ip: '127.0.0.1',
		envelope: JSON.stringify({ from: sender, to: ['info@test.example'] }),
		charsets: JSON.stringify({ to: 'UTF-8', subject: 'UTF-8' })
	};
}

function makeEvent(token: string | null, fields: Record<string, string>) {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);

	const url = new URL('http://localhost/api/sendgrid/inbound');
	if (token !== null) url.searchParams.set('token', token);

	return {
		url,
		request: new Request(url, { method: 'POST', body: formData })
	} as unknown as Parameters<typeof endpoint.POST>[0];
}

beforeEach(async () => {
	await db.delete(schema.inbox);
});

describe('POST', () => {
	test('refuses a request without a token', async () => {
		const sender = `${crypto.randomUUID()}@test.example`;

		await expect(endpoint.POST(makeEvent(null, makePayload(sender)))).rejects.toMatchObject({
			status: 401
		});
		expect(await db.select().from(schema.inbox)).toHaveLength(0);
	});

	test('refuses a request with a wrong token', async () => {
		const sender = `${crypto.randomUUID()}@test.example`;
		const event = makeEvent('verkeerd-token', makePayload(sender));

		await expect(endpoint.POST(event)).rejects.toMatchObject({ status: 401 });
		expect(await db.select().from(schema.inbox)).toHaveLength(0);
	});

	test('stores a valid payload in the inbox', async () => {
		const sender = `${crypto.randomUUID()}@test.example`;
		const event = makeEvent('test-webhook-token', makePayload(sender));

		const response = await endpoint.POST(event);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe('ok');

		const [stored] = await db
			.select()
			.from(schema.inbox)
			.where(eq(schema.inbox.fromAddress, sender));
		expect(stored).toMatchObject({ status: 'ignored' });
	});

	test('acknowledges an invalid payload without storing it', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const event = makeEvent('test-webhook-token', { onzin: 'geen geldige mail' });

		const response = await endpoint.POST(event);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe('ok');
		expect(await db.select().from(schema.inbox)).toHaveLength(0);
		warn.mockRestore();
	});
});
