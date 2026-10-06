import 'dotenv/config';
import { mkdirSync } from 'fs';
import {
	ensureTestTemplate,
	recreateTestDatabase,
	testDatabaseUrl
} from '../test-database.setup.js';
import { testAsker, testFraction, testModerator, testPolitician, testPoliticianUser } from './data';

const baseDatabaseUrl = process.env.TEST_DATABASE_BASE_URL ?? process.env.DATABASE_URL;
if (!baseDatabaseUrl) throw new Error('DATABASE_URL is not set');

await ensureTestTemplate(baseDatabaseUrl);
await recreateTestDatabase(baseDatabaseUrl, 'e2e');

process.env.DATABASE_URL = testDatabaseUrl(baseDatabaseUrl, 'e2e');
const { client, db, schema } = await import('../src/lib/server/db/index.js');

try {
	await db.insert(schema.fraction).values(testFraction);
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
			id: testPoliticianUser.id,
			name: testPoliticianUser.name,
			email: testPoliticianUser.email,
			role: 'politician'
		}
	]);
	await db.insert(schema.politician).values({
		id: testPolitician.id,
		slug: testPolitician.slug,
		userId: testPoliticianUser.id,
		fractionId: testFraction.id,
		fractionRole: 'member'
	});
} finally {
	await client.end();
}

mkdirSync('./test-results/mails', { recursive: true }	);