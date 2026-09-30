export function notAcceptingQuestionsText(name: string, email: string) {
	return `Dit Kamerlid heeft ervoor gekozen niet openbaar antwoord te geven via VraagHetZe. Je kunt ${name} een bericht sturen via ${email}.`;
}

export function preventAdding(event: Event, disable?: boolean) {
	if (disable) event.preventDefault();
}

export type ListActiveType = {
	id: string;
	slug: string;
	acceptsQuestions: boolean;
	fractionRole: string;
	name: string;
	email: string;
	fraction: string;
	fractionName: string;
}

export type PoliticiansType = ListActiveType & {
	commissions: string[];
}

export type CommissionsType = {
	abbreviation: string;
	shortName: string;
};
