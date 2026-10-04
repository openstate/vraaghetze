// shared disposable database setup for Vitest and Playwright

import { execFileSync } from 'node:child_process';
import postgres from 'postgres';

function databaseName(databaseUrl: string) {
	return new URL(databaseUrl).pathname.slice(1);
}

export function testDatabaseUrl(databaseUrl: string, suffix: string) {
	const url = new URL(databaseUrl);
	url.pathname = `/${databaseName(databaseUrl)}_test_${suffix}`;
	return url.toString();
}

// create or rebuild the schema template used to clone test databases
export async function ensureTestTemplate(databaseUrl: string, force = false) {
	const templateName = `${databaseName(databaseUrl)}_test_template`;
	const sql = postgres(databaseUrl);

	try {
		const [template] = await sql`SELECT 1 FROM pg_database WHERE datname = ${templateName}`;
		if (template && !force) return false;

		await sql`DROP DATABASE IF EXISTS ${sql(templateName)} WITH (FORCE)`;
		await sql`CREATE DATABASE ${sql(templateName)}`;

		const templateUrl = testDatabaseUrl(databaseUrl, 'template');
		const templateSql = postgres(templateUrl);
		try {
			// Drizzle push does not create the extension used by the search operators.
			await templateSql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
		} finally {
			await templateSql.end();
		}

		execFileSync('pnpm', ['exec', 'drizzle-kit', 'push', '--force'], {
			stdio: ['ignore', 'ignore', 'inherit'],
			env: { ...process.env, DATABASE_URL: templateUrl }
		});

		return true;
	} finally {
		await sql.end();
	}
}

// replace a test database with a fresh clone of the template
export async function recreateTestDatabase(databaseUrl: string, suffix: string) {
	const name = `${databaseName(databaseUrl)}_test_${suffix}`;
	const templateName = `${databaseName(databaseUrl)}_test_template`;
	const sql = postgres(databaseUrl);

	try {
		await sql`DROP DATABASE IF EXISTS ${sql(name)} WITH (FORCE)`;
		await sql`CREATE DATABASE ${sql(name)} TEMPLATE ${sql(templateName)}`;
	} finally {
		await sql.end();
	}
}

// create a test database from the template when it does not exist
export async function ensureTestDatabase(databaseUrl: string, suffix: string) {
	const name = `${databaseName(databaseUrl)}_test_${suffix}`;
	const templateName = `${databaseName(databaseUrl)}_test_template`;
	const sql = postgres(databaseUrl);

	try {
		const [database] = await sql`SELECT 1 FROM pg_database WHERE datname = ${name}`;
		if (!database) await sql`CREATE DATABASE ${sql(name)} TEMPLATE ${sql(templateName)}`;
	} finally {
		await sql.end();
	}
}
