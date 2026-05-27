export function slugify(value: string) {
	return value
		.normalize('NFKD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function slugifyUnique(name: string, taken: Set<string>) {
	const base = slugify(name);
	let slug = base;
	let suffix = 1;
	while (taken.has(slug)) slug = `${base}-${++suffix}`;
	taken.add(slug);
	return slug;
}
