import type { schema } from '../db';
import type { Persoon } from './data';
import { slugifyUnique } from '../utils/slug';

type Fractie = Persoon['FractieZetelPersoon'][number]['FractieZetel']['Fractie'];

export type Politician = {
	user: Pick<typeof schema.user.$inferInsert, 'id' | 'name' | 'email' | 'emailVerified' | 'role'>;
	politician: Pick<
		typeof schema.politician.$inferInsert,
		'id' | 'slug' | 'userId' | 'isActive' | 'fractionId' | 'fractionRole'
	>;
	fraction: typeof schema.fraction.$inferInsert;
};

export type Existing = {
	politicians: { id: string; userId: string; slug: string }[];
	fractions: { id: string; slug: string }[];
};

export function transformPoliticians(existing: Existing, fetched: Persoon[]) {
	const priorById = new Map(existing.politicians.map((prior) => [prior.id, prior]));
	const takenSlugs = new Set(existing.politicians.map((prior) => prior.slug));

	const fractionSlugs = new Map<string, string>();

	function slugifyFraction(fraction: Fractie) {
		const known = fractionSlugs.get(fraction.Id);
		if (known) return known;

		const taken = new Set(
			existing.fractions.filter((row) => row.id !== fraction.Id).map((row) => row.slug)
		);
		for (const slug of fractionSlugs.values()) taken.add(slug);

		const slug = slugifyUnique(fraction.Afkorting ?? fraction.NaamNL, taken);
		fractionSlugs.set(fraction.Id, slug);
		return slug;
	}

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

		const fraction = fractionPerson.FractieZetel.Fractie;
		const prior = priorById.get(person.Id);
		const userId = prior?.userId ?? crypto.randomUUID();
		const slug = prior?.slug ?? slugifyUnique(name, takenSlugs);
		const fractionSlug = slugifyFraction(fraction);

		return [
			{
				user: {
					id: userId,
					name,
					email,
					emailVerified: true,
					role: 'politician'
				},
				politician: {
					id: person.Id,
					slug,
					userId,
					isActive: true,
					fractionId: fraction.Id,
					fractionRole: fractionPerson.Functie === 'Fractievoorzitter' ? 'chair' : 'member'
				},
				fraction: {
					id: fraction.Id,
					slug: fractionSlug,
					name: fraction.NaamNL,
					abbreviation: fraction.Afkorting ?? null,
					isActive: true
				}
			} satisfies Politician
		];
	});
}
