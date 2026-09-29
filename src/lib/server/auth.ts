import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink } from 'better-auth/plugins';
import { db, schema } from './db';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { sendMagicLinkMail, type MagicLinkPurpose } from './email/templates';
import { ac, defaultRole, roles } from '$lib/permissions';
import { eq } from 'drizzle-orm';

export const MAGIC_LINK_EXPIRY_SECONDS = 30 * 60;
export const MAGIC_LINK_EXPIRY = MAGIC_LINK_EXPIRY_SECONDS * 1000;

// the flow that asked for the link, carried in the callback url the mail links to
const purposeByGoal: Record<string, MagicLinkPurpose> = {
	bevestigen: 'confirm',
	volgen: 'follow'
};

class VerificationNotWrittenError extends Error {
	constructor(message: string) {
		super(message); // Call the constructor of the base class `Error`
		this.name = "VerificationNotWrittenError"; // Set the error name to your custom error class name
		// Set the prototype explicitly to maintain the correct prototype chain
		Object.setPrototypeOf(this, VerificationNotWrittenError.prototype);
	}
}
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
			sendMagicLink: async ({ email, url, token, metadata }) => {
				let urlOrToken = url;
				const link = new URL(url);
				const callbackURL = new URL(link.searchParams.get('callbackURL') ?? '', link.origin);
				let purpose = purposeByGoal[callbackURL.searchParams.get('doel') ?? ''] ?? 'login';

				// There seems to be a bug in Better-Auth where a call to auth.api.signInMagicLink does end up
				// here in sendMagicLink, causing an email to be sent, but where no record in the verification
				// table has been written. This makes the URL that is sent worthless, because the token will
				// not be found. Try to work around this bug by checking here that a record indeed exists in
				// the verification table.
				// Side effect: all MagicLink mails must be sent using sendSignInLink (server-side),
				// authClient.signIn.magicLink (client-side) should NOT be used.
				const recordExists = await verificationExists(token);
				if (!recordExists) throw new VerificationNotWrittenError(`Record with token ${token} not found`);

				if (metadata?.sendCode) {
					urlOrToken = link.searchParams.get('token') || '';
					purpose = 'sendCode';
				}

				if (['login', 'sendCode'].includes(purpose)) {
					const exists = await userExists(email);
					if (!exists) return;
				}

				await sendMagicLinkMail({
					recipient: email,
					urlOrToken,
					purpose,
					expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY)
				});
			}
		})
	]
});

export type UserType = typeof auth.$Infer.Session.user;
export type SessionType = typeof auth.$Infer.Session.session;

export async function sendSignInLink(email: string, callbackURL?: string, metadata?: { [key: string]: string | boolean}): Promise<{ status: "success" | "error"; error?: string; }> {
	let attempts = 0;
	const maxAttempts = 3;
	const { request } = getRequestEvent();

	while (attempts < maxAttempts) {
		try {
			await auth.api.signInMagicLink({ headers: request.headers, body: { email, callbackURL, metadata } });
			return { status: 'success' };
		} catch (error) {
			console.error('Magic link send failed:', error);
			if (error instanceof VerificationNotWrittenError) {
				attempts += 1;
			} else {
				attempts = maxAttempts;
			}
		}
	}

	return { status: 'error', error: `Er is een fout opgetreden, versturen van e-mail naar ${email} is niet gelukt.`}
}

export async function userExists(email: string): Promise<boolean> {
	const [existing] = await db
		.select({ id: schema.user.id, role: schema.user.role })
		.from(schema.user)
		.where(eq(schema.user.email, email))
		.limit(1);

	return !!existing;
}

export async function verificationExists(token: string): Promise<boolean> {
	const [existing] = await db
		.select({ id: schema.verification.id })
		.from(schema.verification)
		.where(eq(schema.verification.identifier, token))
		.limit(1);

	return !!existing;
}
