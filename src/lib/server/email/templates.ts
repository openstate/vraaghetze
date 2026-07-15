import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { schema, type Transaction } from '$lib/server/db';
import { enqueueMail, sendMail } from './outbox';

// pre-launch safety: when DIVERSION_EMAIL is set, all politician-facing mail goes to
// that address and replies from it are accepted as if from the assigned politician
export const resolveMailAddress = (address: string) => env.DIVERSION_EMAIL || address;

type MagicLink = {
	recipient: string;
	url: string;
	purpose: 'confirm' | 'login';
	expiresAt: Date;
};

// sends the sign-in link, worded as a question confirmation when sent from the ask flow
export function sendMagicLinkMail({ recipient, url, purpose, expiresAt }: MagicLink) {
	const { subject, body } =
		purpose === 'confirm'
			? {
					subject: 'Bevestig je vraag op VraagHetZe',
					body: `Met dit e-mailadres is een vraag gesteld op VraagHetZe. Was jij dat? Bevestig je vraag via deze link: ${url}`
				}
			: {
					subject: 'Je inloglink voor VraagHetZe',
					body: `Log hier in: ${url}`
				};

	return sendMail({ kind: 'magic-link', recipient, subject, body, expiresAt });
}

type ModeratedQuestion = {
	id: string;
	title: string;
	body: string;
	slug: string;
	userId: string;
	assigneeId: string;
	emailToken: string | null;
};

// enqueues a notification to the politician and a confirmation to the asker
export async function enqueueApprovalMails(tx: Transaction, question: ModeratedQuestion) {
	const [asker] = await tx
		.select({ name: schema.user.name, email: schema.user.email })
		.from(schema.user)
		.where(eq(schema.user.id, question.userId))
		.limit(1);

	const [politician] = await tx
		.select({ name: schema.user.name, email: schema.user.email })
		.from(schema.user)
		.where(eq(schema.user.id, question.assigneeId))
		.limit(1);

	const questionBody = [
		`Beste ${politician.name},`,
		`${asker.name} stelt u via VraagHetZe de volgende vraag:`,
		`"${question.title}"`,
		`"${question.body}"`,
		`U kunt antwoorden door simpelweg deze e-mail te beantwoorden. Uw antwoord verschijnt daarna openbaar bij de vraag op ${env.ORIGIN}/vragen/${question.slug}.`,
		`Met vriendelijke groet,\nHet VraagHetZe-team`
	]
		.filter(Boolean)
		.join('\n\n');

	await enqueueMail({
		kind: 'question-notification',
		questionId: question.id,
		recipient: resolveMailAddress(politician.email),
		replyTo: `antwoord+${question.emailToken}@${env.EMAIL_DOMAIN}`,
		subject: `Nieuwe vraag via VraagHetZe van ${asker.name}`,
		body: questionBody,
		transaction: tx
	});

	const approvalBody = [
		`Beste ${asker.name},`,
		`Je vraag "${question.title}" is goedgekeurd door onze moderatoren en doorgestuurd naar ${politician.name}. Je vraag staat nu openbaar op ${env.ORIGIN}/vragen/${question.slug}.`,
		`Zodra ${politician.name} antwoordt, ontvang je daarvan een e-mail.`,
		`Met vriendelijke groet,\nHet VraagHetZe-team`
	].join('\n\n');

	await enqueueMail({
		kind: 'moderation-notification',
		questionId: question.id,
		recipient: asker.email,
		subject: 'Je vraag op VraagHetZe is goedgekeurd',
		body: approvalBody,
		transaction: tx
	});
}

// enqueues a rejection notice to the asker, no mail to the politician
export async function enqueueRejectionMail(tx: Transaction, question: ModeratedQuestion) {
	const [asker] = await tx
		.select({ name: schema.user.name, email: schema.user.email })
		.from(schema.user)
		.where(eq(schema.user.id, question.userId))
		.limit(1);

	const body = [
		`Beste ${asker.name},`,
		`Je vraag "${question.title}" is beoordeeld door onze moderatoren en helaas niet goedgekeurd, omdat deze niet voldeed aan de spelregels. De vraag is daarom niet doorgestuurd en wordt niet openbaar gemaakt.`,
		`Je kunt altijd een nieuwe vraag stellen via ${env.ORIGIN}/vragen/stellen.`,
		`Met vriendelijke groet,\nHet VraagHetZe-team`
	].join('\n\n');

	return enqueueMail({
		kind: 'moderation-notification',
		questionId: question.id,
		recipient: asker.email,
		subject: 'Je vraag op VraagHetZe is niet goedgekeurd',
		body,
		transaction: tx
	});
}

type AnsweredQuestion = {
	id: string;
	title: string;
	slug: string;
	askerName: string;
	askerEmail: string;
	politicianName: string;
};

// enqueues a notification to the asker that their question received a public answer
export function enqueueAnswerMail(tx: Transaction, question: AnsweredQuestion) {
	const body = [
		`Beste ${question.askerName},`,
		`Je vraag "${question.title}" is beantwoord door ${question.politicianName}. Je kunt het antwoord lezen op ${env.ORIGIN}/vragen/${question.slug}.`,
		`Met vriendelijke groet,\nHet VraagHetZe-team`
	].join('\n\n');

	return enqueueMail({
		kind: 'answer-notification',
		questionId: question.id,
		recipient: question.askerEmail,
		subject: 'Je vraag op VraagHetZe is beantwoord',
		body,
		transaction: tx
	});
}
