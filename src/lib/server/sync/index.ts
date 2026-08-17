import { notInArray } from 'drizzle-orm';
import { db, schema } from '../db/index';
import { fetchPoliticians } from './data';
import { transformPoliticians } from './transform';
import { conflictColumns } from '../db/utils';
import { syncAvatars } from './avatar';

export async function syncPoliticians() {
	const [existingPoliticians, existingFractions, fetched] = await Promise.all([
		db
			.select({
				id: schema.politician.id,
				userId: schema.politician.userId,
				slug: schema.politician.slug
			})
			.from(schema.politician),
		db.select({ id: schema.fraction.id, slug: schema.fraction.slug }).from(schema.fraction),
		fetchPoliticians()
	]);

	const politicians = transformPoliticians(
		{ politicians: existingPoliticians, fractions: existingFractions },
		fetched
	);

	const fractions = [...new Map(politicians.map((p) => [p.fraction.id, p.fraction])).values()];

	const memberships = politicians.flatMap((p) => p.memberships);

	const commissions = [
		...new Map(memberships.map((m) => [m.commission.id, m.commission])).values()
	];

	await db.transaction(async (tx) => {
		await tx
			.insert(schema.fraction)
			.values(fractions)
			.onConflictDoUpdate({
				target: schema.fraction.id,
				set: conflictColumns(schema.fraction, ['slug', 'name', 'abbreviation', 'isActive'])
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
			.insert(schema.commission)
			.values(commissions)
			.onConflictDoUpdate({
				target: schema.commission.id,
				set: conflictColumns(schema.commission, ['abbreviation', 'name', 'shortName', 'kind'])
			});

		await tx.delete(schema.commissionMembership).where(
			notInArray(
				schema.commissionMembership.id,
				memberships.map((m) => m.membership.id)
			)
		);

		await tx
			.insert(schema.commissionMembership)
			.values(memberships.map((m) => m.membership))
			.onConflictDoUpdate({
				target: schema.commissionMembership.id,
				set: conflictColumns(schema.commissionMembership, [
					'politicianId',
					'commissionId',
					'startedAt'
				])
			});

		await tx.delete(schema.commission).where(
			notInArray(
				schema.commission.id,
				commissions.map((c) => c.id)
			)
		);

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

	await syncAvatars(politicians);

	console.log(
		`Politician sync done: ${politicians.length} politicians, ${fractions.length} fractions, ${commissions.length} commissions`
	);
}
