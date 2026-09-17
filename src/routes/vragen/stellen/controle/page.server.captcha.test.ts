import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db, schema } from '$lib/server/db';
import * as page from './+page.server';
import { createPolitician, makeActionEvent } from '$lib/test-utils';

const sendSignInLink = vi.hoisted(() => vi.fn());
vi.mock(import('$lib/server/auth'), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		sendSignInLink
	}
});

// For the tests in this file the captcha is actually validated.
// For tests that mock validation of the captcha, see page.server.test.ts.

function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {},
	tAndCAccepted: boolean = true
) {
	const useFields = tAndCAccepted ? {...fields, acceptTandC: '1'} : {...fields}

	return makeActionEvent<typeof page.actions.default>(
		`http://localhost/vragen/stellen/controle`,
		user,
		useFields
	);
}

const questionFields = {
	name: 'Vera Vraagsteller',
	title: 'Wat vindt u van de toeslagen?',
	body: 'Graag een toelichting.'
} as const;

beforeEach(async () => {
	sendSignInLink.mockClear();

	await db.transaction(async (tx) => {
		await tx.delete(schema.moderationAction);
		await tx.delete(schema.inbox);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
	});
});

describe('default action', () => {
	test('validates the captcha for an anonymous asker', async () => {
		const { politician } = await createPolitician();
		const email = `nieuw-${crypto.randomUUID()}@test.example`;
		const event = myMakeActionEvent(null, { ...questionFields, email, politicianId: politician.id });

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 403,
			data: { error: 'Captcha validatie is mislukt.' }
		});
	});
});
