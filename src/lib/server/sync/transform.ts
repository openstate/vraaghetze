import type { schema } from '../db';
import type { Persoon } from './data';

export type Politician = {
	user: Pick<typeof schema.user.$inferInsert, 'id' | 'name' | 'email' | 'emailVerified' | 'role'>;
	politician: Pick<
		typeof schema.politician.$inferInsert,
		'id' | 'userId' | 'isActive' | 'fractionId' | 'fractionRole'
	>;
	fraction: typeof schema.fraction.$inferInsert;
};

export function transformPoliticians(
	existing: { id: string; userId: string }[],
	fetched: Persoon[]
) {
	const userIdMap = new Map(existing.map((p) => [p.id, p.userId]));

	return fetched.flatMap((person) => {
		const name = [person.Roepnaam, person.Tussenvoegsel, person.Achternaam]
			.filter(Boolean)
			.join(' ');

		const email = person.PersoonContactinformatie.find((c) => c.Soort === 'E-mail')?.Waarde;

		if (!email) {
			console.log(`Skip no email ${name} [${person.Id}]`);
			return [];
		}

		const fractionPerson = person.FractieZetelPersoon.reduce(
			(latest, curr) => (!curr.TotEnMet && (!latest || curr.Van > latest.Van) ? curr : latest),
			undefined as (typeof person.FractieZetelPersoon)[0] | undefined
		);

		if (!fractionPerson) {
			console.log(`Skip no fraction ${name} [${person.Id}]`);
			return [];
		}

		const fractionId = fractionPerson.FractieZetel.Fractie.Id;
		const userId = userIdMap.get(person.Id) ?? crypto.randomUUID();

		return [
			{
				user: {
					id: userId,
					name,
					email,
					emailVerified: true,
					role: 'user'
				},
				politician: {
					id: person.Id,
					userId,
					isActive: true,
					fractionId,
					fractionRole: fractionPerson.Functie === 'Fractievoorzitter' ? 'chair' : 'member'
				},
				fraction: {
					id: fractionId,
					name: fractionPerson.FractieZetel.Fractie.NaamNL,
					abbreviation: fractionPerson.FractieZetel.Fractie.Afkorting ?? null,
					isActive: true
				}
			} satisfies Politician
		];
	});
}
