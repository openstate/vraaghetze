import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink } from 'better-auth/plugins';
import { db } from './db';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { sendMail } from './outbox';
import { ac, defaultRole, roles } from '$lib/permissions';

const MAGIC_LINK_EXPIRY_SECONDS = 30 * 60;

export const auth = betterAuth({
	baseURL: process.env.ORIGIN,
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	advanced: { database: { generateId: () => crypto.randomUUID() } },
	plugins: [
		admin({ ac, roles, defaultRole }),
		sveltekitCookies(getRequestEvent),
		magicLink({
			expiresIn: MAGIC_LINK_EXPIRY_SECONDS,
			sendMagicLink: async ({ email, url }) => {
				const link = new URL(url);
				const callbackURL = link.searchParams.get('callbackURL');
				const isQuestionConfirmation =
					!!callbackURL &&
					new URL(callbackURL, link.origin).searchParams.get('doel') === 'bevestigen';

				const { subject, text } = isQuestionConfirmation
					? {
							subject: 'Bevestig je vraag op VraagHetZe',
							text: `Met dit e-mailadres is een vraag gesteld op VraagHetZe. Was jij dat? Bevestig je vraag via deze link: ${url}`
						}
					: {
							subject: 'Je inloglink voor VraagHetZe',
							text: `Log hier in: ${url}`
						};

				await sendMail({
					kind: 'magic-link',
					recipient: email,
					subject,
					body: text,
					expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_SECONDS * 1000)
				});
			}
		})
	]
});

export async function sendSignInLink(email: string, callbackURL: string) {
	const { request } = getRequestEvent();
	try {
		await auth.api.signInMagicLink({ headers: request.headers, body: { email, callbackURL } });
	} catch (cause) {
		console.error('Magic link send failed:', cause);
	}
}
