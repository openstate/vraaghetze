import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { client, db, schema } from '../src/lib/server/db';
import { defaultRole, roles } from '../src/lib/permissions';

const [email, role] = process.argv.slice(2);
const roleNames = Object.keys(roles);

if (!email || !role || !roleNames.includes(role)) {
	console.error(`Usage: pnpm tsx scripts/set-role.ts <email> <${roleNames.join('|')}>`);
	process.exit(1);
}

const previous = await db.transaction(async (tx) => {
	const [existing] = await tx
		.select({ id: schema.user.id, role: schema.user.role })
		.from(schema.user)
		.where(eq(schema.user.email, email))
		.limit(1);

	if (!existing) return null;

	await tx.update(schema.user).set({ role }).where(eq(schema.user.id, existing.id));

	return existing;
});

await client.end();

if (!previous) {
	console.error(`No user found for ${email}`);
	process.exit(1);
}

console.log(`${email}: ${previous.role ?? defaultRole} -> ${role}`);
