import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { jsonString, safeEquals, validateForm } from './forms';

function makeFormRequest(fields: Record<string, string>) {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.set(name, value);

	return new Request('http://localhost/test', { method: 'POST', body: formData });
}

const schema = z.object({ name: z.string().min(2), age: z.coerce.number() });

describe('validateForm', () => {
	test('returns parsed data for a valid form', async () => {
		const result = await validateForm(makeFormRequest({ name: 'Jan', age: '42' }), schema);

		expect(result.valid).toBe(true);
		expect(result.data).toEqual({ name: 'Jan', age: 42 });
	});

	test('returns raw data and per-field issues for an invalid form', async () => {
		const result = await validateForm(makeFormRequest({ name: 'J', age: 'geen getal' }), schema);

		expect(result.valid).toBe(false);
		expect(result.data).toEqual({ name: 'J', age: 'geen getal' });

		if (!result.valid) {
			expect(result.issues.name).toBeDefined();
			expect(result.issues.age).toBeDefined();
		}
	});

	test('reports missing required fields', async () => {
		const result = await validateForm(makeFormRequest({}), schema);

		expect(result.valid).toBe(false);
		if (!result.valid) expect(result.issues.name).toBeDefined();
	});
});

describe('jsonString', () => {
	const codec = jsonString(z.object({ id: z.string() }));

	test('decodes a JSON string through the inner schema', () => {
		expect(codec.parse('{"id":"abc"}')).toEqual({ id: 'abc' });
	});

	test('rejects malformed JSON', () => {
		expect(codec.safeParse('geen json').success).toBe(false);
	});

	test('rejects valid JSON that fails the inner schema', () => {
		expect(codec.safeParse('{"id":42}').success).toBe(false);
	});

	test('encodes back to a JSON string', () => {
		expect(z.encode(codec, { id: 'abc' })).toBe('{"id":"abc"}');
	});
});

describe('safeEquals', () => {
	test('returns true for equal strings', () => {
		expect(safeEquals('geheim-token', 'geheim-token')).toBe(true);
	});

	test('returns false for different strings of equal length', () => {
		expect(safeEquals('geheim-token', 'geheim-tokeN')).toBe(false);
	});

	test('returns false for strings of different length without throwing', () => {
		expect(safeEquals('kort', 'veel-langere-string')).toBe(false);
	});
});
