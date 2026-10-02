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

export const hiddenRejectionKeys = [
	'politician_change_rejected'
] as const;

export type hiddenRejectionKeyType = (typeof hiddenRejectionKeys)[number];
type hiddenRejectionReasonsType = Record<hiddenRejectionKeyType, string>;
export const hiddenRejectionReasons: hiddenRejectionReasonsType = {
	politician_change_rejected: 'De vraag is aan het verkeerde Kamerlid gesteld.'
};

export type allRejectionKeyType = rejectionKeyType | hiddenRejectionKeyType;
type allRejectionReasonsType = Record<allRejectionKeyType, string>;
export const allRejectionReasons: allRejectionReasonsType = {...rejectionReasons, ...hiddenRejectionReasons};

export const rejectionReasonTexts = (rejectionReason?: string | null) => {
	if (!rejectionReason) return [];

	const reasons: allRejectionKeyType[] = rejectionReason.split(',').map((reason) => reason as allRejectionKeyType);
	return reasons.map((reason) => allRejectionReasons[reason]);
};
