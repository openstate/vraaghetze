import { describe, expect, test } from 'vitest';
import type { Persoon } from './data';
import { transformPoliticians } from './transform';

type Seat = Persoon['FractieZetelPersoon'][number];

function makeSeat(overrides: Partial<Seat> = {}): Seat {
	return {
		Id: 'zetel-1',
		Functie: 'Lid',
		Van: '2025-01-01',
		TotEnMet: null,
		FractieZetel: { Fractie: { Id: 'fractie-1', NaamNL: 'Demopartij', Afkorting: 'DP' } },
		...overrides
	};
}

function makePersoon(overrides: Partial<Persoon> = {}): Persoon {
	return {
		Id: 'persoon-1',
		Initialen: 'J.',
		Roepnaam: 'Jan',
		Tussenvoegsel: null,
		Achternaam: 'Jansen',
		Functie: 'Tweede Kamerlid',
		Verwijderd: false,
		FractieZetelPersoon: [makeSeat()],
		PersoonContactinformatie: [{ Soort: 'E-mail', Waarde: 'j.jansen@tweedekamer.nl' }],
		...overrides
	};
}

describe('transformPoliticians', () => {
	test('maps a person to user, politician and fraction rows', () => {
		const [result] = transformPoliticians([], [makePersoon()]);

		expect(result.user).toMatchObject({
			name: 'Jan Jansen',
			email: 'j.jansen@tweedekamer.nl',
			emailVerified: true,
			role: 'politician'
		});
		expect(result.politician).toMatchObject({
			id: 'persoon-1',
			slug: 'jan-jansen',
			userId: result.user.id,
			isActive: true,
			fractionId: 'fractie-1',
			fractionRole: 'member'
		});
		expect(result.fraction).toEqual({
			id: 'fractie-1',
			name: 'Demopartij',
			abbreviation: 'DP',
			isActive: true
		});
	});

	test('skips people without an email address', () => {
		const withoutEmail = makePersoon({ PersoonContactinformatie: [] });
		const otherContact = makePersoon({
			PersoonContactinformatie: [{ Soort: 'Website', Waarde: 'https://example.nl' }]
		});

		expect(transformPoliticians([], [withoutEmail, otherContact])).toEqual([]);
	});

	test('skips people without active fraction membership', () => {
		const ended = makePersoon({ FractieZetelPersoon: [makeSeat({ TotEnMet: '2024-12-31' })] });
		const seatless = makePersoon({ FractieZetelPersoon: [] });

		expect(transformPoliticians([], [ended, seatless])).toEqual([]);
	});

	test('picks the most recent active seat', () => {
		const seats = [
			makeSeat({
				Id: 'zetel-oud',
				Van: '2021-03-31',
				FractieZetel: { Fractie: { Id: 'fractie-oud', NaamNL: 'Oude Partij', Afkorting: 'OP' } }
			}),
			makeSeat({ Id: 'zetel-nieuw', Van: '2025-12-01' }),
			makeSeat({
				Id: 'zetel-beeindigd',
				Van: '2026-01-01',
				TotEnMet: '2026-02-01',
				FractieZetel: { Fractie: { Id: 'fractie-ex', NaamNL: 'Ex Partij', Afkorting: 'EX' } }
			})
		];

		const [result] = transformPoliticians([], [makePersoon({ FractieZetelPersoon: seats })]);

		expect(result.politician.fractionId).toBe('fractie-1');
		expect(result.fraction.name).toBe('Demopartij');
	});

	test('preserves userId and slug of previously synced politicians', () => {
		const existing = [{ id: 'persoon-1', userId: 'user-999', slug: 'jan-de-eerste' }];

		const [result] = transformPoliticians(existing, [makePersoon()]);

		expect(result.user.id).toBe('user-999');
		expect(result.politician.userId).toBe('user-999');
		expect(result.politician.slug).toBe('jan-de-eerste');
	});

	test('dedupes slugs against existing and same-batch politicians', () => {
		const existing = [{ id: 'persoon-oud', userId: 'user-1', slug: 'jan-jansen' }];
		const fetched = [makePersoon({ Id: 'persoon-2' }), makePersoon({ Id: 'persoon-3' })];

		const results = transformPoliticians(existing, fetched);

		expect(results.map((entry) => entry.politician.slug)).toEqual(['jan-jansen-2', 'jan-jansen-3']);
	});
});
