export const TIME_ZONE = 'Europe/Amsterdam';

export const EMPTY = '—';

const dateFormat = new Intl.DateTimeFormat('nl-NL', {
	dateStyle: 'medium',
	timeZone: TIME_ZONE
});

const dateTimeFormat = new Intl.DateTimeFormat('nl-NL', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: TIME_ZONE
});

const longDateFormat = new Intl.DateTimeFormat('nl-NL', {
	dateStyle: 'long',
	timeZone: TIME_ZONE
});

const longDateTimeFormat = new Intl.DateTimeFormat('nl-NL', {
	dateStyle: 'long',
	timeStyle: 'short',
	timeZone: TIME_ZONE
});

export function formatDate(value: Date | null) {
	return value === null ? EMPTY : dateFormat.format(value);
}

/** Spelled-out date for running text, e.g. "1 mei 2025". */
export function formatDateLong(value: Date | null) {
	return value === null ? EMPTY : longDateFormat.format(value);
}

export function formatDateTime(value: Date | null) {
	return value === null ? EMPTY : dateTimeFormat.format(value);
}

/** Spelled-out date and time, for the tooltip behind an abbreviated one. */
export function formatDateTimeLong(value: Date | null) {
	return value === null ? EMPTY : longDateTimeFormat.format(value);
}
