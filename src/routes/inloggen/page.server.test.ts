import { describe, expect, test, vi } from 'vitest';
import { schema } from '$lib/server/db';
import * as page from './+page.server';
import { createUser, getUserByEmail, makeActionEvent } from '$lib/test-utils';
import type { ActionFailure } from '@sveltejs/kit';
import { userExists } from '$lib/server/auth';
import * as captcha from '$lib/server/utils/captcha';

const mockEvent = {
	request: new Request('http://localhost/inloggen'),
	url: new URL('http://localhost/inloggen'),
	locals: { },
	cookies: {
		get: vi.fn((key) => undefined),
		set: vi.fn()
	}
};

vi.mock('$app/server', () => ({
	getRequestEvent: vi.fn(() => mockEvent)
}));

// For the tests in this file the validation of the captcha is mocked.
// For tests that actually validate the captcha, see page.server.captcha.test.ts.
const validateCaptcha = vi.hoisted(() => (() => Promise.resolve(true)));
vi.mock('$lib/server/utils/captcha', () => ({ validateCaptcha }));

type actionEventOptions = {
	acceptTandC?: string;
	ageChecked?: string;
}

function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {},
	options: actionEventOptions = {}
) {
	if (typeof options.acceptTandC === 'undefined') options.acceptTandC = '1';
	if (typeof options.ageChecked === 'undefined') options.ageChecked = '1';

	const useFields = {
		...fields,
		...options,
		capToken: 'a_cap_token'
	}

	return makeActionEvent<typeof page.actions.default>(
		`http://localhost/inloggen`,
		user,
		useFields
	);
}

const newName = 'A new name';
const newEmail = `${crypto.randomUUID()}@test.example`;

describe('registering', () => {
	test('accepts a name and new email address', async () => {
		const event = myMakeActionEvent(null, {
			email: newEmail,
			name: newName,
			formType: 'newUser'
		});

    let result = (await page.actions.default(event)) as page.defaultActionType;

    expect(result).toMatchObject({ sent: true });
    expect(await userExists(newEmail)).toBe(true);
    const user = await getUserByEmail(newEmail);
    expect(user.tAndCAccepted).toBeTruthy();
	});

	test('validates the new email address', async () => {
		const event = myMakeActionEvent(null, {
			email: 'thisIsNotAnEmailAddress',
			name: newName,
			formType: 'newUser'
		});

		const result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

    expect(result.status).toBe(400);
		expect(result.data.issues).toMatchObject({
			email: ['Vul een geldig e-mailadres in.']
		});
	});

	test('checks that new email address does not exist yet', async () => {
		const existingUser = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(null, {
			email: existingUser.email,
			name: existingUser.name,
			formType: 'newUser'
		});

		let result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

		expect(result.status).toBe(400);
		expect(result.data.error).toBe(
			'Er bestaat al een account met dit e-mailadres, gebruik het formulier hiernaast om in te loggen'
		);
		expect(result.data.initializeNewUser).toBe(true);
	});

  test('requires acceptance of the terms and conditions', async () => {
		const event = myMakeActionEvent(null, {
			email: newEmail,
			name: newName,
			formType: 'newUser'
		}, { acceptTandC: '' });

    const result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

    expect(result.status).toBe(400);
    expect(result.data.issues).toMatchObject({
      acceptTandC: ['De Algemene Voorwaarden zijn niet geaccepteerd.']
    });
  });

	test('requires age confirmation', async () => {
		const event = myMakeActionEvent(null, {
			email: newEmail,
			name: newName,
			formType: 'newUser'
		}, { ageChecked: ''});

		const result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

		expect(result.status).toBe(400);
		expect(result.data.issues).toMatchObject({
			ageChecked: ['Om VraagHetZe te kunnen gebruiken moet je minimaal 16 jaar zijn of toestemming van je ouders hebben.']
		});
	});
});