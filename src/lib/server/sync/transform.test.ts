import { describe, expect, test } from 'vitest';
import type { CommissieZetelPersoon, Persoon } from './data';
import { transformPoliticians, type Existing } from './transform';

type Seat = Persoon['FractieZetelPersoon'][number];

const NOTHING_SYNCED_YET: Existing = { politicians: [], fractions: [] };

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

function makeCommissieZetel(overrides: Partial<CommissieZetelPersoon> = {}): CommissieZetelPersoon {
	return {
		Id: 'commissiezetel-1',
		Van: '2025-01-01T00:00:00+01:00',
		CommissieZetel: {
			Commissie: {
				Id: 'commissie-1',
				NaamNL: 'Vaste commissie voor Onderwijs, Cultuur en Wetenschap',
				NaamWebNL: 'Onderwijs, Cultuur en Wetenschap',
				Afkorting: 'OCW',
				Inhoudsopgave: 'Vaste commissies'
			}
		},
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
		CommissieZetelVastPersoon: [],
		...overrides
	};
}

describe('transformPoliticians', () => {
	test('maps a person to user, politician and fraction rows', () => {
		const [result] = transformPoliticians(NOTHING_SYNCED_YET, [makePersoon()]);

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
			slug: 'dp',
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

		expect(transformPoliticians(NOTHING_SYNCED_YET, [withoutEmail, otherContact])).toEqual([]);
	});

	test('skips people without active fraction membership', () => {
		const ended = makePersoon({ FractieZetelPersoon: [makeSeat({ TotEnMet: '2024-12-31' })] });
		const seatless = makePersoon({ FractieZetelPersoon: [] });

		expect(transformPoliticians(NOTHING_SYNCED_YET, [ended, seatless])).toEqual([]);
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

		const [result] = transformPoliticians(NOTHING_SYNCED_YET, [
			makePersoon({ FractieZetelPersoon: seats })
		]);

		expect(result.politician.fractionId).toBe('fractie-1');
		expect(result.fraction.name).toBe('Demopartij');
	});

	test('preserves userId and slug of previously synced politicians', () => {
		const existing = {
			...NOTHING_SYNCED_YET,
			politicians: [{ id: 'persoon-1', userId: 'user-999', slug: 'jan-de-eerste' }]
		};

		const [result] = transformPoliticians(existing, [makePersoon()]);

		expect(result.user.id).toBe('user-999');
		expect(result.politician.userId).toBe('user-999');
		expect(result.politician.slug).toBe('jan-de-eerste');
	});

	test('dedupes slugs against existing and same-batch politicians', () => {
		const existing = {
			...NOTHING_SYNCED_YET,
			politicians: [{ id: 'persoon-oud', userId: 'user-1', slug: 'jan-jansen' }]
		};
		const fetched = [makePersoon({ Id: 'persoon-2' }), makePersoon({ Id: 'persoon-3' })];

		const results = transformPoliticians(existing, fetched);

		expect(results.map((entry) => entry.politician.slug)).toEqual(['jan-jansen-2', 'jan-jansen-3']);
	});

	test('follows a fraction that renamed itself, leaving the others alone', () => {
		const renamed = makeSeat({
			FractieZetel: { Fractie: { Id: 'fractie-2', NaamNL: 'Nieuwe Partij', Afkorting: 'NP' } }
		});
		const existing = {
			...NOTHING_SYNCED_YET,
			fractions: [
				{ id: 'fractie-1', slug: 'dp' },
				{ id: 'fractie-2', slug: 'oude-partij' }
			]
		};
		const fetched = [
			makePersoon({ Id: 'persoon-1' }),
			makePersoon({ Id: 'persoon-2' }),
			makePersoon({ Id: 'persoon-3', FractieZetelPersoon: [renamed] })
		];

		const unchanged = { id: 'fractie-1', slug: 'dp', name: 'Demopartij', abbreviation: 'DP' };

		const results = transformPoliticians(existing, fetched);

		expect(results.map((entry) => entry.fraction)).toEqual([
			{ ...unchanged, isActive: true },
			{ ...unchanged, isActive: true },
			{ id: 'fractie-2', slug: 'np', name: 'Nieuwe Partij', abbreviation: 'NP', isActive: true }
		]);
	});

	test('maps a seat to a commission and a membership row', () => {
		const person = makePersoon({ CommissieZetelVastPersoon: [makeCommissieZetel()] });

		const [result] = transformPoliticians(NOTHING_SYNCED_YET, [person]);

		expect(result.memberships).toHaveLength(1);
		expect(result.memberships[0].commission).toEqual({
			id: 'commissie-1',
			name: 'Vaste commissie voor Onderwijs, Cultuur en Wetenschap',
			shortName: 'Onderwijs, Cultuur en Wetenschap',
			abbreviation: 'OCW',
			kind: 'Vaste commissies'
		});
		expect(result.memberships[0].membership).toEqual({
			id: 'commissiezetel-1',
			politicianId: 'persoon-1',
			commissionId: 'commissie-1',
			startedAt: new Date('2025-01-01T00:00:00+01:00')
		});
	});
});
