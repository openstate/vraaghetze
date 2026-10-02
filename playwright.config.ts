// run with `pnpm test:e2e` or `pnpm test:e2e:ui`
// run `pnpm test:setup` first if the database schema changed

import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { testDatabaseUrl } from './test-database.setup';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!process.env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is not set');

const baseURL = 'http://127.0.0.1:4173';
const baseDatabaseUrl = process.env.TEST_DATABASE_BASE_URL ?? process.env.DATABASE_URL;
const databaseUrl = testDatabaseUrl(baseDatabaseUrl, 'e2e');

Object.assign(process.env, {
	TEST_DATABASE_BASE_URL: baseDatabaseUrl,
	DATABASE_URL: databaseUrl,
	ORIGIN: baseURL,
	BETTER_AUTH_URL: baseURL
});

export default defineConfig({
	workers: 1,
	testDir: './e2e',
	use: {
		baseURL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command:
			'pnpm exec tsx e2e/setup.ts && pnpm build && pnpm preview --host 127.0.0.1 --port 4173',
		stdout: 'ignore',
		stderr: 'ignore',
		url: baseURL,
		reuseExistingServer: false,
		env: {
			TEST_DATABASE_BASE_URL: baseDatabaseUrl,
			DATABASE_URL: databaseUrl,
			ORIGIN: baseURL,
			BETTER_AUTH_URL: baseURL,
			BASIC_AUTH_USER: '',
			BASIC_AUTH_PASSWORD: '',
			BACKGROUND_JOBS_ENABLED: 'false'
		}
	}
});
