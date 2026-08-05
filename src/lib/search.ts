import { z } from 'zod';
import { normalizeTerm } from './url';

export const RESULTS_PER_PAGE = 10;

export const STATUS_OPTIONS = ['alles', 'beantwoord', 'onbeantwoord'] as const;
export const SORT_OPTIONS = ['relevantie', 'nieuwste', 'oudste'] as const;

export type SearchStatus = (typeof STATUS_OPTIONS)[number];
export type SearchSort = (typeof SORT_OPTIONS)[number];

export type SearchQuery = {
	term: string;
	status: SearchStatus;
	fractions: string[];
	politicians: string[];
	from: string | null;
	until: string | null;
	sort: SearchSort;
};

const values = z
	.array(z.string())
	.catch([])
	.transform((entries) => entries.map((entry) => entry.trim()).filter(Boolean));

const searchSchema = z.object({
	q: z.string().catch('').transform(normalizeTerm),
	status: z.enum(STATUS_OPTIONS).catch('alles'),
	fractie: values,
	kamerlid: values,
	van: z.iso.date().nullable().catch(null),
	tot: z.iso.date().nullable().catch(null),
	sorteer: z.enum(SORT_OPTIONS).nullable().catch(null)
});

export function parseSearch(url: URL) {
	const parsed = searchSchema.parse({
		q: url.searchParams.get('q') ?? undefined,
		status: url.searchParams.get('status') ?? undefined,
		fractie: url.searchParams.getAll('fractie'),
		kamerlid: url.searchParams.getAll('kamerlid'),
		van: url.searchParams.get('van'),
		tot: url.searchParams.get('tot'),
		sorteer: url.searchParams.get('sorteer')
	});

	return {
		term: parsed.q,
		status: parsed.status,
		fractions: parsed.fractie,
		politicians: parsed.kamerlid,
		from: parsed.van,
		until: parsed.tot,
		sort: resolveSort(parsed.sorteer, parsed.q)
	} satisfies SearchQuery;
}

export const getImpliedSort = (term: string | null) =>
	(term ? 'relevantie' : 'nieuwste') satisfies SearchSort;

function resolveSort(sorteer: SearchSort | null, term: string) {
	const impliedSort = getImpliedSort(term);
	if (!sorteer || (sorteer === 'relevantie' && !term)) return impliedSort;
	return sorteer;
}

export function hasActiveFilters(query: SearchQuery) {
	return (
		query.status !== 'alles' ||
		query.fractions.length > 0 ||
		query.politicians.length > 0 ||
		query.from !== null ||
		query.until !== null
	);
}
