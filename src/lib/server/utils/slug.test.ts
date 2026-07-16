import { describe, expect, test } from 'vitest';
import { slugify, slugifyUnique } from './slug';

describe('slugify', () => {
	test('lowercases and replaces separators with dashes', () => {
		expect(slugify('Jan Peter van der Steen')).toBe('jan-peter-van-der-steen');
	});

	test('strips diacritics', () => {
		expect(slugify('Ségolène Öztürk')).toBe('segolene-ozturk');
	});

	test('collapses consecutive non-alphanumeric characters', () => {
		expect(slugify("Jan-Peter  & 't Hart!")).toBe('jan-peter-t-hart');
	});

	test('trims leading and trailing dashes', () => {
		expect(slugify(' (Jan) ')).toBe('jan');
	});
});

describe('slugifyUnique', () => {
	test('returns the base slug when free and marks it as taken', () => {
		const taken = new Set<string>();

		expect(slugifyUnique('Jan Jansen', taken)).toBe('jan-jansen');
		expect(taken.has('jan-jansen')).toBe(true);
	});

	test('appends incrementing suffixes on collisions', () => {
		const taken = new Set(['jan-jansen']);

		expect(slugifyUnique('Jan Jansen', taken)).toBe('jan-jansen-2');
		expect(slugifyUnique('Jan Jansen', taken)).toBe('jan-jansen-3');
	});
});
