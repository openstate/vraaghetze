import { describe, expect, test, vi } from 'vitest';
import { schema } from '$lib/server/db';
import * as page from './+page.server';
import {
	createPolitician,
	createSession,
	createUser,
	createVerification,
	getUser,
	registerMakeActionEvent
} from '$lib/test-utils';
import type { ActionFailure, RequestEvent } from '@sveltejs/kit';
import type { RouteParams } from './$types';

const mockEvent = {
	request: new Request('http://localhost/vragen/stellen/gegevens'),
	url: new URL('http://localhost/vragen/stellen/gegevens'),
	locals: { user: { id: 1, name: 'Test User' } },
	cookies: {
		get: vi.fn((key) => (key === 'session_id' ? '12345' : undefined)),
		set: vi.fn()
	}
};

vi.mock('$app/server', () => ({
	getRequestEvent: vi.fn(() => mockEvent)
}));

type actionEventOptions = {
	acceptTandC?: string;
	ageChecked?: string;
	setConfirmationEmail?: boolean;
}

function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {},
	allOptions: actionEventOptions = {}
) {
	return registerMakeActionEvent(
		user,
		fields,
		allOptions,
		true,
		page,
		"http://localhost/vragen/stellen/gegevens"
	) as RequestEvent<RouteParams, "/vragen/stellen/gegevens">;
}

const questionFields = {
	title: 'Wat vindt u van de toeslagen?',
	body: 'Graag een toelichting.'
} as const;

const newName = 'A new name';
const newEmail = `${crypto.randomUUID()}@test.example`;

describe('no user logged in', () => {
	test('accepts a name and new email address', async () => {
		const { politician } = await createPolitician();
		const event = myMakeActionEvent(null, {
			...questionFields,
			email: newEmail,
			name: newName,
			politicianId: politician.id,
			formType: 'newUser'
		});

		await expect(page.actions.default(event)).rejects.toMatchObject({
			status: 303,
			location: '/vragen/stellen/controle'
		});
	});

	test('validates the new email address', async () => {
		const { politician } = await createPolitician();
		const event = myMakeActionEvent(null, {
			...questionFields,
			email: 'thisIsNotAnEmailAddress',
			name: newName,
			politicianId: politician.id,
			formType: 'newUser'
		});

		const result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;
		expect(result.status).toBe(400);
		expect(result.data.issues).toMatchObject({
			email: ['Vul een geldig e-mailadres in.']
		});
	});

	test('checks that new email address does not exist yet', async () => {
		const { politician } = await createPolitician();
		const existingUser = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(null, {
			...questionFields,
			email: existingUser.email,
			name: existingUser.name,
			politicianId: politician.id,
			formType: 'newUser'
		});

		let result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

		expect(result.status).toBe(400);
		expect(result.data.error).toBe(
			'Er bestaat al een account met dit e-mailadres, gebruik het formulier hiernaast om in te loggen'
		);
		expect(result.data.initializeNewUser).toBe(true);
	});

	test('requires confirmation of email address', async () => {
		const { politician } = await createPolitician();
		const event = myMakeActionEvent(null, {
			...questionFields,
			email: newEmail,
			name: newName,
			politicianId: politician.id,
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
		}, { acceptTandC: ''});

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

	// userLogin is handled in client
	test('responds with askForCode after providing email address', async () => {
		const { politician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(null, {
			...questionFields,
			politicianId: politician.id,
			emailExisting: asker.email,
			formType: 'userLogin'
		});

		let result = (await page.actions.default(event)) as page.defaultActionType;

		expect(result.askForCode).toBe(true);
	});
});

describe('user without name logged in', () => {
	test('adds the name to the user', async () => {
		const newName = 'My new name';
		const { politician } = await createPolitician();
		const existingUser = await createUser('');
		const event = myMakeActionEvent(existingUser, {
			...questionFields,
			name: newName,
			politicianId: politician.id,
			formType: 'missingName'
		});

		await expect(page.actions.default(event)).rejects.toMatchObject({
			status: 303,
			location: '/vragen/stellen/controle'
		});

		const updatedUser = await getUser(existingUser.id);
		expect(updatedUser.name).toBe(newName);
	});
});

describe('user trying to login', () => {
	test('validates code', async () => {
		const { politician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const event = myMakeActionEvent(null, {
			...questionFields,
			politicianId: politician.id,
			code: 'aninvalidcode',
			formType: 'codeFromEmail'
		});

    expect(event.locals.session).toBeUndefined();

    let result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

		expect(result.status).toBe(400);
		expect(result.data.askForCode).toBe(true);
		expect(result.data.issues).toMatchObject({ code: ['Code niet bekend']});
    expect(event.locals.session).toBeUndefined();
	});

	test('returns verified for correct code', async () => {
		const { politician } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const token = 'mLzwAgKAyjnFfFXKPppvxIbpSPJdLGtV';

		const event = myMakeActionEvent(null, {
			...questionFields,
			politicianId: politician.id,
			code: token,
			formType: 'codeFromEmail'
		});

		await createSession(asker.id, token);
		await createVerification(token, asker.email);

    expect(event.locals.session).toBeUndefined();

		await expect(page.actions.default(event)).rejects.toMatchObject({
			status: 303,
			location: '/vragen/stellen/controle'
		});

    expect(event.locals.session).not.toBeUndefined();
	});
});
