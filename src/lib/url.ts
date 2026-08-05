export const normalizeTerm = (term: string) => {
	return term.trim().slice(0, 200);
};

export function toSearchParams(fields: Iterable<[string, FormDataEntryValue]>) {
	const params = new URLSearchParams();

	for (const [key, value] of fields) {
		if (typeof value !== 'string' || value === '') continue;
		params.append(key, value);
	}

	return params;
}
