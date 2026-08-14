import { z } from 'zod';
import { resolve } from '$app/paths';
import { toSearchParams } from './url';

export const QUESTION_TITLE_MIN_LENGTH = 10;
export const QUESTION_TITLE_MAX_LENGTH = 200;
export const QUESTION_BODY_MAX_LENGTH = 1000;

export const askSchema = z.object({
	name: z.string().trim().min(1, 'Vul je volledige naam in.'),
	email: z.string().trim().toLowerCase().pipe(z.email('Vul een geldig e-mailadres in.')),
	title: z
		.string()
		.trim()
		.min(
			QUESTION_TITLE_MIN_LENGTH,
			`Schrijf een vraag van minstens ${QUESTION_TITLE_MIN_LENGTH} tekens.`
		)
		.max(
			QUESTION_TITLE_MAX_LENGTH,
			`Houd je vraag korter dan ${QUESTION_TITLE_MAX_LENGTH} tekens.`
		),
	body: z
		.string()
		.trim()
		.max(QUESTION_BODY_MAX_LENGTH, `Houd je context korter dan ${QUESTION_BODY_MAX_LENGTH} tekens.`)
		.default(''),
	politicianId: z.string().min(1, 'Kies een Kamerlid.')
});

export type AskField = keyof z.output<typeof askSchema>;
export type AskValues = Record<AskField, string>;
export type AskIssues = Partial<Record<AskField, string[]>>;

export type AskStep = {
	id: string;
	title: string;
	path: string;
	fields: readonly AskField[];
};

export const ASK_STEPS = [
	{
		id: 'kamerlid',
		title: 'Kamerlid kiezen',
		path: resolve('/vragen/stellen/kamerlid'),
		fields: ['politicianId']
	},
	{
		id: 'vraag',
		title: 'Vraag schrijven',
		path: resolve('/vragen/stellen/vraag'),
		fields: ['title', 'body']
	},
	{
		id: 'gegevens',
		title: 'Gegevens invullen',
		path: resolve('/vragen/stellen/gegevens'),
		fields: ['name', 'email']
	},
	{
		id: 'controle',
		title: 'Versturen',
		path: resolve('/vragen/stellen/controle'),
		fields: []
	}
] as const satisfies readonly AskStep[];

export function validateAskStep(
	values: Partial<AskValues>,
	fields: readonly AskField[]
): AskIssues {
	const result = askSchema.safeParse(values);
	const fieldErrors = result.success ? {} : (z.flattenError(result.error).fieldErrors as AskIssues);

	return Object.fromEntries(fields.map((field) => [field, fieldErrors[field]]));
}

export function submitAskStep(
	form: HTMLFormElement | undefined,
	values: Partial<AskValues>,
	fields: readonly AskField[]
) {
	const issues = validateAskStep(values, fields);

	const invalidField = fields.find((field) => issues[field]);
	if (invalidField) {
		const control = form?.elements.namedItem(invalidField);
		if (control instanceof HTMLElement) control.focus();
	}

	return { issues, valid: !invalidField };
}

export type AskDraft = { aan: string; vraag: string; context: string };

/** returns the current form state based on URL */
export function draftFromUrl(url: URL): AskDraft {
	const read = (key: string) => (url.searchParams.get(key) ?? '').trim();

	return {
		aan: read('aan'),
		vraag: read('vraag').slice(0, QUESTION_TITLE_MAX_LENGTH),
		context: read('context').slice(0, QUESTION_BODY_MAX_LENGTH)
	};
}

/** returns the link to a given step */
export function stepHref(stepId: string, draft: AskDraft) {
	const params = toSearchParams([
		['aan', draft.aan],
		['vraag', draft.vraag],
		['context', draft.context]
	]);

	const path = ASK_STEPS.find((step) => step.id === stepId)!.path;

	const query = String(params);
	return query ? `${path}?${query}` : path;
}

const stepIndex = (stepId: string) => ASK_STEPS.findIndex((step) => step.id === stepId);

/** returns the step the asker should be on */
export function stepToAnswer(draft: AskDraft) {
	if (!draft.aan) return 'kamerlid';
	if (!draft.vraag) return 'vraag';

	return 'controle';
}

/** returns whether the given step is ahead of the step the asker should be on */
export const stepIsAhead = (stepId: string, draft: AskDraft) =>
	stepIndex(stepId) > stepIndex(stepToAnswer(draft));

export type AskDetails = { name: string; email: string };

const STORAGE_KEY = 'vraaghetze:gegevens';

const NOBODY: AskDetails = { name: '', email: '' };

export function readDetails(): AskDetails {
	try {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		return stored ? { ...NOBODY, ...JSON.parse(stored) } : NOBODY;
	} catch {
		return NOBODY;
	}
}

export function writeDetails(details: AskDetails) {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
	} catch {
		/* intentionally empty */
	}
}

export function clearDetails() {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		/* intentionally empty */
	}
}
