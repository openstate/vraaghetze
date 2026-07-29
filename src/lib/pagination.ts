import { z } from 'zod';

export const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export type Pagination = { page: number; perPage: number };

const paginationSchema = z.object({
	pagina: z.coerce.number().int().min(1).catch(1),
	per: z.coerce
		.number()
		.int()
		.min(1)
		.max(PER_PAGE_OPTIONS[PER_PAGE_OPTIONS.length - 1])
		.catch(PER_PAGE_OPTIONS[1])
});

export function parsePagination(url: URL) {
	const parsed = paginationSchema.parse({
		pagina: url.searchParams.get('pagina') ?? undefined,
		per: url.searchParams.get('per') ?? undefined
	});

	return { page: parsed.pagina, perPage: parsed.per } satisfies Pagination;
}
