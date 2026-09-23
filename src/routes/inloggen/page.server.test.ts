import { describe, expect, test, vi } from 'vitest';
import { schema } from '$lib/server/db';
import * as page from './+page.server';
import { createUser, getUserByEmail, registerMakeActionEvent, type registerActionEventOptions } from '$lib/test-utils';
import type { ActionFailure, RequestEvent } from '@sveltejs/kit';
import { userExists } from '$lib/server/auth';
import type { RouteParams } from './$types';

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

function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {},
	allOptions: registerActionEventOptions = {}
) {
	return registerMakeActionEvent(
		user,
		fields,
		allOptions,
		false,
		page,
		"http://localhost/inloggen"
	) as RequestEvent<RouteParams, "/inloggen">;
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
			'Er bestaat al een account met dit e-mailadres.'
		);
		expect(result.data.initializeNewUser).toBe(true);
	});

	test('requires confirmation of email address', async () => {
		const event = myMakeActionEvent(null, {
			email: newEmail,
			name: newName,
			formType: 'newUser'
		}, { setConfirmationEmail: false });

		const result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

		expect(result.status).toBe(400);
		expect(result.data.issues).toMatchObject({
			emailConfirmation: ['Bevestiging e-mailadres komt niet overeen.']
		});
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