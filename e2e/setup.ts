import 'dotenv/config';
import { mkdirSync } from 'fs';
import {
	ensureTestTemplate,
	recreateTestDatabase,
	testDatabaseUrl
} from '../test-database.setup.js';
import { testAsker, testOtherFraction, testFraction, testModerator, testOtherPolitician, testOtherPoliticianUser, testPolitician, testPoliticianUser, testAdmin } from './data';

const baseDatabaseUrl = process.env.TEST_DATABASE_BASE_URL ?? process.env.DATABASE_URL;
if (!baseDatabaseUrl) throw new Error('DATABASE_URL is not set');

await ensureTestTemplate(baseDatabaseUrl);
await recreateTestDatabase(baseDatabaseUrl, 'e2e');

process.env.DATABASE_URL = testDatabaseUrl(baseDatabaseUrl, 'e2e');
const { client, db, schema } = await import('../src/lib/server/db/index.js');

try {
	await db.insert(schema.fraction).values([
		testFraction,
		testOtherFraction
	]);
	await db.insert(schema.user).values([
		{
			...testAsker,
			role: 'user'
		},
		{
			...testModerator,
			role: 'moderator'
		},
		{
			...testAdmin,
			role: 'admin'
		},
		{
			...testPoliticianUser,
			role: 'politician'
		},
		{
			...testOtherPoliticianUser,
			role: 'politician'
		}
	]);
	await db.insert(schema.politician).values([
		{
			...testPolitician,
			userId: testPoliticianUser.id,
			fractionId: testFraction.id,
			fractionRole: 'member'
		},
		{
			...testOtherPolitician,
			userId: testOtherPoliticianUser.id,
			fractionId: testOtherFraction.id,
			fractionRole: 'member'
		}
	]);
} finally {
	await client.end();
}

mkdirSync('./test-results/mails', { recursive: true }	);
mkdirSync('./test-results/bash-scripts', { recursive: true }	);