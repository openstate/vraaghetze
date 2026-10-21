import { questionStatusPills } from './components/status-pill.svelte';
import { HTMLModerationActions, HTMLAnswers } from './general';
import { type QuestionStatus } from './moderation';
import type { QuestionDetailsType } from './server/moderation';

export const statusToText = {
	pending: 'Ongemodereerde vraag',
	'pending-wrong-politician': 'Andere politicus voorgesteld',
	approved: 'Goedgekeurde vraag',
	rejected: 'Afgewezen vraag',
	answered: 'Beantwoorde vraag'
} satisfies Record<QuestionStatus, string>;

export type Detail = [
	label: string,
	value: string | Date | null | HTMLModerationActions | HTMLAnswers | boolean,
	hidden?: boolean
];

export function question2Details(row: QuestionDetailsType) {
	const details1 = [
		['Id', row.id, true],
		['Vraag', row.title],
		['Context', row.body || '—'],
		['Vraagsteller', row.authorName],
		['Kamerlid', row.politicianName],
		['Aangemaakt op', row.createdAt],
		['Status', questionStatusPills[row.verifiedAt ? row.status : 'unverified'].label]
	] satisfies Detail[];

	let extra: Detail[] = [];

	if (row.status === 'answered') {
		const moderationAction = row.moderationActions.filter(
			(a) => a.answerId && a.action === 'approved'
		)[0];
		if (moderationAction) {
			extra = [...extra, ['Beantwoord op', moderationAction.createdAt]];
		}
	}

	if (row.remindedAt) {
			extra = [...extra, ['Herinnering gestuurd', row.remindedAt]];
	}

	const details2 = [
		['Moderatie geschiedenis', new HTMLModerationActions(row.moderationActions)],
		['Antwoorden', new HTMLAnswers(row.answers)],
		['ActionableChangePolitician', row.status == 'approved', true]
	] satisfies Detail[];

	const details = [...details1, ...extra, ...details2] satisfies Detail[];
	return details;
}
