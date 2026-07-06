import { error, type Handle, type ServerInit } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';
import { Cron } from 'croner';
import { syncPoliticians } from '$lib/server/sync';

export const init: ServerInit = () => {
	if (building) return;

	const syncJob = new Cron('0 4 * * *', () =>
		syncPoliticians().catch((error) => console.error('Politician sync failed:', error))
	);

	syncJob.trigger();
};

const FORM_CONTENT_TYPES = [
	'application/x-www-form-urlencoded',
	'multipart/form-data',
	'text/plain'
];

const handleCsrf: Handle = async ({ event, resolve }) => {
	// exempt inbound parse webhook
	if (event.url.pathname.startsWith('/api/sendgrid/')) return resolve(event);

	const contentType = event.request.headers.get('content-type')?.split(';')[0].trim() ?? '';
	const isFormSubmission =
		['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method) &&
		FORM_CONTENT_TYPES.includes(contentType.toLowerCase());

	if (isFormSubmission && event.request.headers.get('origin') !== event.url.origin)
		error(403, `Cross-site ${event.request.method} form submissions are forbidden`);

	return resolve(event);
};

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

export const handle = sequence(handleCsrf, handleBasicAuth, handleBetterAuth);
