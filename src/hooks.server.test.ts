import { describe, expect, test, vi } from 'vitest';
import * as hooks from './hooks.server';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

function makeUser(role: string | null) {
	return { id: crypto.randomUUID(), role } as App.Locals['user'];
}

async function guard(routeId: string | null, user: App.Locals['user'] = undefined) {
	const resolve = vi.fn(async () => new Response('ok'));
	const event = { route: { id: routeId }, locals: { user } };

	const thrown = await Promise.resolve(hooks.handleAuthorization({ event, resolve } as never))
		.then(() => null)
		.catch((r: { status?: number }) => r);

	return { blockedWith: thrown?.status, passedThrough: resolve.mock.calls.length > 0 };
}

const moderationRoutes = ['/modereren', '/modereren/wachtrij', '/modereren/inbox'];

describe('handleAuthorization', () => {
	test.each(moderationRoutes)('refuses an anonymous visitor of %s', async (routeId) => {
		const { blockedWith, passedThrough } = await guard(routeId);

		expect(blockedWith).toBe(403);
		expect(passedThrough).toBe(false);
	});

	test.each(moderationRoutes)(
		'refuses a user without moderator permission on %s',
		async (routeId) => {
			const { blockedWith, passedThrough } = await guard(routeId, makeUser('user'));

			expect(blockedWith).toBe(403);
			expect(passedThrough).toBe(false);
		}
	);

	test.each(moderationRoutes)('lets a moderator through to %s', async (routeId) => {
		const { blockedWith, passedThrough } = await guard(routeId, makeUser('moderator'));

		expect(blockedWith).toBeUndefined();
		expect(passedThrough).toBe(true);
	});

	test.each(['/', '/vragen/[slug]', '/moderatie', '/modereren-publiek', null])(
		'leaves %s outside the moderation section alone',
		async (routeId) => {
			const { blockedWith, passedThrough } = await guard(routeId);

			expect(blockedWith).toBeUndefined();
			expect(passedThrough).toBe(true);
		}
	);
});
