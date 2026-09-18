import { describe, expect, test, vi } from 'vitest';
import { schema } from '$lib/server/db';
import * as page from './+page.server';
import { makeActionEvent } from '$lib/test-utils';
import type { ActionFailure } from '@sveltejs/kit';

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

// For the tests in this file the captcha is actually validated.
// For tests that mock validation of the captcha, see page.server.test.ts.

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
  test('requires checking the captcha', async () => {
		const event = myMakeActionEvent(null, {
			email: newEmail,
			name: newName,
			formType: 'newUser'
		});

    const result = (await page.actions.default(event)) as ActionFailure<page.defaultActionType>;

    expect(result.status).toBe(403);
    expect(result.data.error).toBe('Captcha validatie is mislukt.');
  });
});