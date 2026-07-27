import 'dotenv/config';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// give every worker its own copy of the test database, so test files can run in parallel
// this file runs before every test file, but the url only needs to be rewritten once
if (!process.env.DATABASE_URL.includes('_test_')) {
	const databaseUrl = new URL(process.env.DATABASE_URL);
	databaseUrl.pathname += `_test_${process.env.VITEST_POOL_ID}`;
	process.env.DATABASE_URL = databaseUrl.toString();
}
