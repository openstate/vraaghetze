import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';

const handleBasicAuth: Handle = async ({ event, resolve }) => {
	if (!env.BASIC_AUTH_USER || !env.BASIC_AUTH_PASSWORD) return resolve(event);

	const header = event.request.headers.get('authorization');
	if (header?.startsWith('Basic ')) {
		const provided = Buffer.from(atob(header.slice(6)));
		const expected = Buffer.from(`${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASSWORD}`);
		if (provided.length === expected.length && timingSafeEqual(provided, expected))
			return resolve(event);
	}

	return new Response('Authentication required', {
		status: 401,
		headers: { 'WWW-Authenticate': 'Basic realm="vraaghetze"' }
	});
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = sequence(handleBasicAuth, handleBetterAuth);
