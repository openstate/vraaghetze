import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink } from 'better-auth/plugins';
import { db } from './db';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { sendMagicLinkMail, type MagicLinkPurpose } from './email/templates';
import { ac, defaultRole, roles } from '$lib/permissions';

const MAGIC_LINK_EXPIRY_SECONDS = 30 * 60;

// the flow that asked for the link, carried in the callback url the mail links to
const purposeByGoal: Record<string, MagicLinkPurpose> = {
	bevestigen: 'confirm',
	volgen: 'follow'
};

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
				const callbackURL = new URL(link.searchParams.get('callbackURL') ?? '', link.origin);

				await sendMagicLinkMail({
					recipient: email,
					url,
					purpose: purposeByGoal[callbackURL.searchParams.get('doel') ?? ''] ?? 'login',
					expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_SECONDS * 1000)
				});
			}
		})
	]
});

export type User = typeof auth.$Infer.Session.user;

export async function sendSignInLink(email: string, callbackURL: string) {
	const { request } = getRequestEvent();
	try {
		await auth.api.signInMagicLink({ headers: request.headers, body: { email, callbackURL } });
	} catch (cause) {
		console.error('Magic link send failed:', cause);
	}
}
