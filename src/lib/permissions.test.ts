import { describe, expect, test } from 'vitest';
import * as permissions from './permissions';

describe('hasPermission', () => {
	test('gives an anonymous visitor the default asking permission and nothing more', () => {
		expect(permissions.hasPermission(null, { question: ['ask'] })).toBe(true);
		expect(permissions.hasPermission(undefined, { question: ['ask'] })).toBe(true);
		expect(permissions.hasPermission(null, { question: ['moderate'] })).toBe(false);
		expect(permissions.hasPermission(null, { question: ['answer'] })).toBe(false);
	});

	test('falls back to the default role for an empty role string', () => {
		expect(permissions.hasPermission({ role: '' }, { question: ['ask'] })).toBe(true);
		expect(permissions.hasPermission({ role: null }, { question: ['ask'] })).toBe(true);
	});

	test.each([
		{ role: 'user', ask: true, answer: false, moderate: false },
		{ role: 'politician', ask: false, answer: true, moderate: false },
		{ role: 'moderator', ask: false, answer: false, moderate: true },
		{ role: 'admin', ask: false, answer: false, moderate: true }
	])('grants $role exactly its own permissions', ({ role, ask, answer, moderate }) => {
		expect(permissions.hasPermission({ role }, { question: ['ask'] })).toBe(ask);
		expect(permissions.hasPermission({ role }, { question: ['answer'] })).toBe(answer);
		expect(permissions.hasPermission({ role }, { question: ['moderate'] })).toBe(moderate);
	});

	test('combines permissions of comma-separated roles', () => {
		const combined = { role: 'user,moderator' };

		expect(permissions.hasPermission(combined, { question: ['ask'] })).toBe(true);
		expect(permissions.hasPermission(combined, { question: ['moderate'] })).toBe(true);
		expect(permissions.hasPermission(combined, { question: ['answer'] })).toBe(false);
	});

	test('grants an unknown role nothing', () => {
		expect(permissions.hasPermission({ role: 'onzinrol' }, { question: ['ask'] })).toBe(false);
		expect(permissions.hasPermission({ role: 'onzinrol' }, { question: ['moderate'] })).toBe(false);
	});
});
