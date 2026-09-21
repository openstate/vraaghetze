import { error, type Handle, type ServerInit } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';
import { timingSafeEqual } from 'node:crypto';
import { Cron } from 'croner';
import { syncPoliticians } from '$lib/server/sync';
import { deliverOutbox } from '$lib/server/email/outbox';
import { authorizeAdmin, authorizeModerator } from '$lib/server/moderation';
import type { ENV_TYPE } from '$lib/general';

export const init: ServerInit = () => {
	if (building) return;

	const syncJob = new Cron('0 4 * * *', () =>
		syncPoliticians().catch((error) => console.error('Politician sync failed:', error))
	);

	const deliveryJob = new Cron('*/5 * * * *', () => {
		deliverOutbox().catch((error) => console.error('Outbox delivery failed:', error));
	});

	syncJob.trigger();
	deliveryJob.trigger();
};

const FORM_CONTENT_TYPES = [
	'application/x-www-form-urlencoded',
	'multipart/form-data',
	'text/plain'
];

// The inbound parse webhook is authenticated by its own token instead.
const isInboundWebhook = (url: URL) => url.pathname.startsWith('/api/sendgrid/');

const handleSetEnv: Handle = async ({ event, resolve }) => {
	const env = process.env.ENV as ENV_TYPE;

	switch (env) {
		case 'development':
			event.locals.isDevelopment = true;
			break;
		case 'production':
			event.locals.isProduction = true;
			break;
		case 'staging':
			event.locals.isStaging = true;
			break;
	}

	return resolve(event);
};

const handleCsrf: Handle = async ({ event, resolve }) => {
	if (isInboundWebhook(event.url)) return resolve(event);

	const contentType = event.request.headers.get('content-type')?.split(';')[0].trim() ?? '';
	const isFormSubmission =
		['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method) &&
		FORM_CONTENT_TYPES.includes(contentType.toLowerCase());

	if (isFormSubmission && event.request.headers.get('origin') !== event.url.origin)
		error(403, `Cross-site ${event.request.method} form submissions are forbidden`);

	return resolve(event);
};

// can be removed after launch
const handleBasicAuth: Handle = async ({ event, resolve }) => {
	if (!env.BASIC_AUTH_USER || !env.BASIC_AUTH_PASSWORD) return resolve(event);
	if (isInboundWebhook(event.url)) return resolve(event);

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

const isModerationRoute = (routeId: string | null) => /^\/modereren(\/|$)/.test(routeId ?? '');

const isAdminRoute = (routeId: string | null) => {
	if (!routeId) return false;

	if ([
		"/politici/[slug]/bewerken",
		"/gebruikers"
	].includes(routeId)) return true;

	return false;
}

// event.route should not be used for authorization in case of Remote Functions (see
// https://svelte.dev/docs/kit/@sveltejs-kit#RequestEvent). If we ever start to use Remote
// Functions authorization will need a refactoring.
export function notForRemoteFunctions(isRemoteRequest: boolean) {
	if (isRemoteRequest) error(403, 'Geen toegang');
}

export const handleAuthorization: Handle = async ({ event, resolve }) => {
	notForRemoteFunctions(event.isRemoteRequest);

	if (isModerationRoute(event.route.id)) authorizeModerator(event.locals.user);
	if (isAdminRoute(event.route.id)) authorizeAdmin(event.locals.user);
	return resolve(event);
};

export const handle = sequence(handleSetEnv, handleCsrf, handleBasicAuth, handleBetterAuth, handleAuthorization);
