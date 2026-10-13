import { z } from 'zod';

export const rejectionKeys = [
	'spam_promotion',
	'duplicate',
	'no_question',
	'personal_attack',
	'defamation',
	'threatening',
	'offensive',
	'victimizing',
	'professional_secrecy',
	'privacy_others',
	'personal_data',
	'no_author'
] as const;

export type rejectionKeyType = (typeof rejectionKeys)[number];
type rejectionReasonsType = Record<rejectionKeyType, string>;
export const rejectionReasons: rejectionReasonsType = {
	spam_promotion: 'Je vraag is als spam beoordeeld.',
	duplicate: 'Deze vraag is eerder gesteld en beantwoord.',
	no_question: 'Het bericht bevat geen beantwoordbare vraag.',
	personal_attack: 'Je vraag bevat beledigende taal.',
	defamation: 'Je vraag bevat niet-onderbouwde beschuldigingen.',
	threatening: 'Je vraag bevat een dreiging met geweld.',
	offensive: 'Je vraag bevat elementen van haat, onderdrukking of discriminatie.',
	victimizing: 'Je vraag bevat negatieve bejegening van slachtoffers van ernstig leed.',
	professional_secrecy: 'Je vraag bevat vertrouwelijke informatie en schendt het beroepsgeheim.',
	privacy_others: 'Je vraag bevat details over het privéleven van anderen.',
	personal_data: 'Je vraag bevat gevoelige persoons- of contactgegevens.',
	no_author: 'De vraag is niet vanuit een persoonlijk account gesteld.'
};

export const hiddenRejectionKeys = ['politician_change_rejected'] as const;

export type hiddenRejectionKeyType = (typeof hiddenRejectionKeys)[number];
type hiddenRejectionReasonsType = Record<hiddenRejectionKeyType, string>;
export const hiddenRejectionReasons: hiddenRejectionReasonsType = {
	politician_change_rejected: 'De vraag is aan het verkeerde Kamerlid gesteld.'
};

export type allRejectionKeyType = rejectionKeyType | hiddenRejectionKeyType;
type allRejectionReasonsType = Record<allRejectionKeyType, string>;
export const allRejectionReasons: allRejectionReasonsType = {
	...rejectionReasons,
	...hiddenRejectionReasons
};

export const rejectionReasonTexts = (rejectionReason?: string | null) => {
	if (!rejectionReason) return [];

	const reasons: allRejectionKeyType[] = rejectionReason
		.split(',')
		.map((reason) => reason as allRejectionKeyType);
	return reasons.map((reason) => allRejectionReasons[reason]);
};

const commonStatuses = ['pending', 'approved', 'rejected'] as const;
const questionOnlyStatuses = ['pending-wrong-politician'] as const;
export const questionStatuses = [...commonStatuses, ...questionOnlyStatuses] as const;
export type QuestionStatus = typeof questionStatuses[number];

const answerOnlyStatuses = ['updateAsker'] as const;
export const answerStatuses = [...commonStatuses, ...answerOnlyStatuses] as const;
export type AnswerStatus = typeof answerStatuses[number];

export const questionStatusPillsKeys = [...commonStatuses, ...questionOnlyStatuses, ...answerOnlyStatuses, 'unverified'] as const;
export type questionStatusPillsType = typeof questionStatusPillsKeys[number];

export const redactionInfo = (searchTexts: string[], replaceTexts: string[]) => {
	const info = [];
	for (const [index, searchText] of searchTexts.entries()) {
		const replaceText = replaceTexts[index];
		info.push(`"${searchText}" → "${replaceText}"`);
	}

	return info.join(' , ');
};

export const inboxIgnoreReasons = [
	'ignored',
	'ignored_dkim_failure',
	'ignored_question_not_approved',
	'ignored_question_already_answered',
	'ignored_different_sender'
] as const;
const inboxOtherReasons = ['received', 'processed', 'failed'] as const;
export const inboxStatuses = [...inboxIgnoreReasons, ...inboxOtherReasons];
export type InboxIgnoreReason = (typeof inboxIgnoreReasons)[number];
export type InboxStatus = (typeof inboxStatuses)[number];

export const inboxStatusTitles = (extended?: boolean) => {
	return {
		received: 'Onafgehandelde e-mail',
		processed: 'Verwerkte e-mail',
		ignored: 'Genegeerde e-mail',
		ignored_dkim_failure: `Genegeerde e-mail${extended ? ' (dkim)' : ''}`,
		ignored_question_not_approved: `Genegeerde e-mail${extended ? ' (afgewezen)' : ''}`,
		ignored_question_already_answered: `Genegeerde e-mail${extended ? ' (al beantwoord)' : ''}`,
		ignored_different_sender: `Genegeerde e-mail${extended ? ' (andere afzender)' : ''}`,
		failed: 'Mislukte e-mail'
	} satisfies Record<InboxStatus, string>;
}

export type ModerationSearchQuery = {
	inboxStatusSelect?: InboxStatus | null;
	archiveStatusSelect?: questionStatusPillsType | null;
};

const moderationSearchSchema = z.object({
	inboxStatusSelect: z.enum(inboxStatuses).nullable().catch(null),
	archiveStatusSelect: z.enum(questionStatusPillsKeys).nullable().catch(null)
});

export function parseModerationSearch(url: URL) {
	const parsed = moderationSearchSchema.parse({
		inboxStatusSelect: url.searchParams.get('inboxStatusSelect'),
		archiveStatusSelect: url.searchParams.get('archiveStatusSelect'),
	});

	return {
		inboxStatusSelect: parsed.inboxStatusSelect,
		archiveStatusSelect: parsed.archiveStatusSelect
	} satisfies ModerationSearchQuery;
}
