import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink } from 'better-auth/plugins';
import { db } from './db';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { sendEmail } from './email';

export const auth = betterAuth({
	baseURL: process.env.ORIGIN,
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	advanced: { database: { generateId: () => crypto.randomUUID() } },
	plugins: [
		admin(),
		sveltekitCookies(getRequestEvent),
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				await sendEmail({ to: email, subject: 'Your sign-in link', text: `Sign in here: ${url}` });
			}
		})
	]
});
