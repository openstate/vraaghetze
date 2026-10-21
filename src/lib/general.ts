import { applyAction, deserialize } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import type { ActionResult } from '@sveltejs/kit';
import type { schema } from './server/db';
import type { ModerationActionDetailsType } from './server/moderation';

export type ENV_TYPE = 'development' | 'production' | 'staging' | 'testing';
export const DAY_MS = 24 * 60 * 60 * 1000;

export class HTMLModerationActions {
	public value: ModerationActionDetailsType[];

	constructor(value: ModerationActionDetailsType[]) {
		this.value = value;
	}
}

export class HTMLAnswers {
	public value: typeof schema.answer.$inferSelect[];

	constructor(value: typeof schema.answer.$inferSelect[]) {
		this.value = value;
	}
}

export const submitDirectly = async (
	currentTarget: HTMLFormElement,
	submitter: HTMLElement | null,
	addFields: { [key: string]: string } = {}
) => {
	const formData = new FormData(currentTarget, submitter);
	for (const [k, v] of Object.entries(addFields)) {
		formData.append(k, v);
	}

	const response = await fetch('', {
		method: 'POST',
		body: formData
	});

	const result: ActionResult = deserialize(await response.text());
	if (result.type === 'success') {
		// rerun all `load` functions, following the successful update
		await invalidateAll();
	}

	applyAction(result);
};

export const safeReturnTo = (urlString: string | null) => {
	if (!urlString) return undefined;

	const url = new URL(urlString);

	if (`${url.protocol}//${url.host}` === process.env.ORIGIN) {
		return url;
	} else {
		return undefined;
	}
}
