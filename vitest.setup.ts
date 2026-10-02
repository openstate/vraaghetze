// run with `pnpm test` or `pnpm test:watch`
// run `pnpm test:setup` if db schema changed

import 'dotenv/config';
import {
	ensureTestDatabase,
	ensureTestTemplate,
	recreateTestDatabase
} from './test-database.setup';

const workerCount = 8;

export default async function setup() {
	if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	const rebuilt = await ensureTestTemplate(process.env.DATABASE_URL, !!process.env.SETUP);

	for (let worker = 1; worker <= workerCount; worker++) {
		const suffix = String(worker);
		if (rebuilt) await recreateTestDatabase(process.env.DATABASE_URL, suffix);
		else await ensureTestDatabase(process.env.DATABASE_URL, suffix);
	}
}
