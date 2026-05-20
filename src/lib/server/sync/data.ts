import z from 'zod';

// --- SCHEMAS ---

const FractieZetelPersoonSchema = z.object({
	Id: z.string(),
	Functie: z.string(),
	Van: z.string(),
	TotEnMet: z.string().nullable(),
	FractieZetel: z.object({
		Fractie: z.object({ Id: z.string(), NaamNL: z.string(), Afkorting: z.string().nullable() })
	})
});

const PersoonSchema = z.object({
	Id: z.string(),
	Initialen: z.string().nullable(),
	Roepnaam: z.string().nullable(),
	Tussenvoegsel: z.string().nullable(),
	Achternaam: z.string(),
	Functie: z.string(),
	Verwijderd: z.boolean(),
	FractieZetelPersoon: z.array(FractieZetelPersoonSchema),
	PersoonContactinformatie: z.array(z.object({ Soort: z.string(), Waarde: z.string() }))
});

const ResponseSchema = z.object({ value: z.array(PersoonSchema) });

export type Persoon = z.infer<typeof PersoonSchema>;

// --- LOGIC ---

const ODATA_BASE_URL = 'https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0';
const PAGE_SIZE = 250;

export async function fetchPoliticians() {
	const filter = encodeURIComponent("Functie eq 'Tweede Kamerlid' and Verwijderd eq false");

	const expand = encodeURIComponent(
		"FractieZetelPersoon($expand=FractieZetel($expand=Fractie)),PersoonContactinformatie($filter=Soort eq 'E-mail')"
	);

	const url = `${ODATA_BASE_URL}/Persoon?$filter=${filter}&$expand=${expand}&$top=${PAGE_SIZE}`;

	const res = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!res.ok) throw new Error(`OData fetch failed: ${res.status} ${res.statusText}`);

	const data = ResponseSchema.parse(await res.json());

	return data.value;
}
