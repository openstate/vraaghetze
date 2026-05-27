import { notInArray } from 'drizzle-orm';
import { db, schema } from '../db/index';
import { fetchPoliticians } from './data';
import { transformPoliticians } from './transform';
import { conflictColumns } from '../db/utils';
import { syncAvatars } from './avatar';

export async function syncPoliticians() {
	const [existing, fetched] = await Promise.all([
		db
			.select({
				id: schema.politician.id,
				userId: schema.politician.userId,
				slug: schema.politician.slug
			})
			.from(schema.politician),
		fetchPoliticians()
	]);

	const existingIds = new Set(existing.map((pol) => pol.id));
	const politicians = transformPoliticians(existing, fetched);
	const fractions = [...new Map(politicians.map((p) => [p.fraction.id, p.fraction])).values()];

	await db.transaction(async (tx) => {
		await tx
			.insert(schema.fraction)
			.values(fractions)
			.onConflictDoUpdate({
				target: schema.fraction.id,
				set: conflictColumns(schema.fraction, ['name', 'abbreviation', 'isActive'])
			});

		await tx
			.insert(schema.user)
			.values(politicians.map((p) => p.user))
			.onConflictDoUpdate({
				target: schema.user.id,
				set: conflictColumns(schema.user, ['name', 'email', 'emailVerified', 'role'])
			});

		await tx
			.insert(schema.politician)
			.values(politicians.map((p) => p.politician))
			.onConflictDoUpdate({
				target: schema.politician.id,
				set: conflictColumns(schema.politician, ['isActive', 'fractionId', 'fractionRole'])
			});

		await tx
			.update(schema.politician)
			.set({ isActive: false })
			.where(
				notInArray(
					schema.politician.id,
					politicians.map((p) => p.politician.id)
				)
			);

		await tx
			.update(schema.fraction)
			.set({ isActive: false })
			.where(
				notInArray(
					schema.fraction.id,
					fractions.map((f) => f.id)
				)
			);
	});

	await syncAvatars(politicians, existingIds);
}
