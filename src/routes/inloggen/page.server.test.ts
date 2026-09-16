import { describe, expect, test, vi } from 'vitest';
import { schema } from '$lib/server/db';
import * as page from './+page.server';
import { createUser, makeActionEvent } from '$lib/test-utils';
import type { ActionFailure } from '@sveltejs/kit';
import { userExists } from '$lib/server/auth';

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


function myMakeActionEvent(
	user: typeof schema.user.$inferSelect | null,
	fields: Record<string, string> = {}
) {
	return makeActionEvent<typeof page.actions.default>(
		`http://localhost/inloggen`,
		user,
		fields
	);
}

const newName = 'A new name';
const newEmail = `${crypto.randomUUID()}@test.example`;

describe('no user logged in', () => {
	test('accepts a name and new email address', async () => {
		const event = myMakeActionEvent(null, {
			email: newEmail,
			name: newName,
			formType: 'newUser'
		});

    let result = (await page.actions.default(event)) as page.defaultActionType;

    expect(await userExists(newEmail)).toBe(true);

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
});