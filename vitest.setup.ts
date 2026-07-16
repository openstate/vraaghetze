import 'dotenv/config';
import { execSync } from 'node:child_process';
import postgres from 'postgres';

export default async function setup() {
	if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	const databaseUrl = new URL(process.env.DATABASE_URL);
	const databaseName = `${databaseUrl.pathname.slice(1)}_test`;

	const sql = postgres(process.env.DATABASE_URL);
	try {
		await sql`DROP DATABASE IF EXISTS ${sql(databaseName)} WITH (FORCE)`;
		await sql`CREATE DATABASE ${sql(databaseName)}`;
	} finally {
		await sql.end();
	}

	databaseUrl.pathname = `/${databaseName}`;
	process.env.DATABASE_URL = databaseUrl.toString();

	execSync('pnpm exec drizzle-kit push --force', { stdio: ['ignore', 'ignore', 'inherit'] });
}
