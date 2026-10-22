import type { schema } from './server/db';
import type { ModerationActionDetailsType } from './server/db/app.schema';

export type ENV_TYPE = 'development' | 'production' | 'staging' | 'testing';
export const DAY_MS = 24 * 60 * 60 * 1000;
export const SEND_REMINDER_AFTER_DAYS = 14;
export const SEND_REMINDER_AFTER = SEND_REMINDER_AFTER_DAYS * DAY_MS;

export class HTMLModerationActions {
	public value: ModerationActionDetailsType[];

	constructor(value: ModerationActionDetailsType[]) {
		this.value = value;
	}
}

export class HTMLAnswers {
	public value: (typeof schema.answer.$inferSelect)[];

	constructor(value: (typeof schema.answer.$inferSelect)[]) {
		this.value = value;
	}
}

export class HTMLInboxRows {
	public value: (typeof schema.inbox.$inferSelect)[];

	constructor(value: (typeof schema.inbox.$inferSelect)[]) {
		this.value = value;
	}
}

export const safeReturnTo = (urlString: string | null) => {
	if (!urlString) return undefined;

	const url = new URL(urlString);

	if (`${url.protocol}//${url.host}` === process.env.ORIGIN) {
		return url;
	} else {
		return undefined;
	}
};
