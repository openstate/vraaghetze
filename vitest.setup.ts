// run with `pnpm test` or `pnpm test:watch`
// run `pnpm test:reset` if db schema changed

import 'dotenv/config';
import { execSync } from 'node:child_process';
import postgres from 'postgres';

const workerCount = 8;

export default async function setup() {
	if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	const databaseUrl = new URL(process.env.DATABASE_URL);
	const databaseName = databaseUrl.pathname.slice(1);
	const templateName = `${databaseName}_test_template`;

	const sql = postgres(process.env.DATABASE_URL);
	try {
		const [template] = await sql`SELECT 1 FROM pg_database WHERE datname = ${templateName}`;
		if (template && !process.env.RESET) return;

		await sql`DROP DATABASE IF EXISTS ${sql(templateName)} WITH (FORCE)`;
		await sql`CREATE DATABASE ${sql(templateName)}`;

		databaseUrl.pathname = `/${templateName}`;

		// push does not create extensions, which search's `<%` operator needs
		const templateSql = postgres(databaseUrl.toString());
		try {
			await templateSql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
		} finally {
			await templateSql.end();
		}

		execSync('pnpm exec drizzle-kit push --force', {
			stdio: ['ignore', 'ignore', 'inherit'],
			env: { ...process.env, DATABASE_URL: databaseUrl.toString() }
		});

		for (let worker = 1; worker <= workerCount; worker++) {
			const workerName = `${databaseName}_test_${worker}`;
			await sql`DROP DATABASE IF EXISTS ${sql(workerName)} WITH (FORCE)`;
			await sql`CREATE DATABASE ${sql(workerName)} TEMPLATE ${sql(templateName)}`;
		}
	} finally {
		await sql.end();
	}
}
