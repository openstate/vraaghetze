import 'dotenv/config';
import {
	ensureTestTemplate,
	recreateTestDatabase,
	testDatabaseUrl
} from '../test-database.setup.js';
import { testAsker, testFraction, testPolitician } from './data';

const baseDatabaseUrl = process.env.TEST_DATABASE_BASE_URL ?? process.env.DATABASE_URL;
if (!baseDatabaseUrl) throw new Error('DATABASE_URL is not set');

await ensureTestTemplate(baseDatabaseUrl);
await recreateTestDatabase(baseDatabaseUrl, 'e2e');

process.env.DATABASE_URL = testDatabaseUrl(baseDatabaseUrl, 'e2e');
const { client, db, schema } = await import('../src/lib/server/db/index.js');

try {
	await db.insert(schema.fraction).values(testFraction);
	await db.insert(schema.user).values([
		testAsker,
		{
			id: testPolitician.userId,
			name: testPolitician.name,
			email: testPolitician.email
		}
	]);
	await db.insert(schema.politician).values({
		id: testPolitician.id,
		slug: testPolitician.slug,
		userId: testPolitician.userId,
		fractionId: testFraction.id,
		fractionRole: 'member'
	});
} finally {
	await client.end();
}
