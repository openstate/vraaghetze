import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { testUtils } from 'better-auth/plugins';
import { expect, test as base, type BrowserContext } from '@playwright/test';
import { client, db, schema } from '../src/lib/server/db/index.js';

export const test = base.extend<Record<never, never>, { db: typeof db }>({
	db: [
		// eslint-disable-next-line no-empty-pattern
		async ({}, use) => {
			try {
				await use(db);
			} finally {
				await client.end();
			}
		},
		{ scope: 'worker' }
	]
});

const testAuth = betterAuth({
	baseURL: process.env.ORIGIN,
	secret: process.env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	advanced: { database: { generateId: () => crypto.randomUUID() } },
	plugins: [testUtils()]
});

export async function signInAs(context: BrowserContext, userId: string) {
	const cookies = await (
		await testAuth.$context
	).test.getCookies({
		userId,
		domain: '127.0.0.1'
	});
	await context.addCookies(cookies);
}

export { expect, schema };
