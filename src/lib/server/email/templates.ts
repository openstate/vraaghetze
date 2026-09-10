import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db, schema, type Transaction } from '$lib/server/db';
import { enqueueMail, sendMail } from './outbox';
import QuestionConfirmation from './templates/question-confirmation.svelte';
import { render } from 'svelte/server';

// pre-launch safety: when DIVERSION_EMAIL is set, all politician-facing mail goes to
// that address and replies from it are accepted as if from the assigned politician
export const resolveMailAddress = (address: string) => env.DIVERSION_EMAIL || address;

// the sign-in link is worded after the flow it was requested from
const magicLinkCopy = {
	confirm: (url: string) => ({
		subject: 'Bevestig je vraag op VraagHetZe',
		body: `Met dit e-mailadres is een vraag gesteld op VraagHetZe. Was jij dat? Bevestig je vraag via deze link: ${url}`
	}),
	follow: (url: string) => ({
		subject: 'Volg een vraag op VraagHetZe',
		body: `Met dit e-mailadres is aangegeven dat je een vraag op VraagHetZe wilt volgen. Bevestig via deze link en druk daarna op de bel bij de vraag: ${url}`
	}),
	login: (url: string) => ({
		subject: 'Je inloglink voor VraagHetZe',
		body: `Log hier in: ${url}`
	})
};

export type MagicLinkPurpose = keyof typeof magicLinkCopy;

type MagicLink = {
	recipient: string;
	url: string;
	purpose: MagicLinkPurpose;
	expiresAt: Date;
};

export function sendMagicLinkMail({ recipient, url, purpose, expiresAt }: MagicLink) {
	const { subject, body } = magicLinkCopy[purpose](url);

	return sendMail({ kind: 'magic-link', recipient, subject, body, expiresAt });
}

type VerifiedQuestion = {
	id: string;
	title: string;
	slug: string;
	userId: string;
	assigneeId: string;
};

// sends a receipt to the asker as soon as the question is theirs for certain and before a
// moderator has looked at it
export async function sendConfirmationMail(question: VerifiedQuestion) {
	const [asker] = await db
		.select({ name: schema.user.name, email: schema.user.email })
		.from(schema.user)
		.where(eq(schema.user.id, question.userId))
		.limit(1);

	const [politician] = await db
		.select({ name: schema.user.name })
		.from(schema.user)
		.where(eq(schema.user.id, question.assigneeId))
		.limit(1);

	const result = render(QuestionConfirmation, { props: {
		askerName: asker.name,
		politicianName: politician.name,
		questionTitle: question.title,
		questionHref: `${env.ORIGIN}/vragen/${question.slug}`
	}});
	const body = result.body.replace(/<!--[\[\]]*-->/g, '');

	return sendMail({
		kind: 'question-confirmation',
		questionId: question.id,
		recipient: asker.email,
		subject: 'We hebben je vraag op VraagHetZe ontvangen',
		body
	});
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
		`U kunt antwoorden door simpelweg deze e-mail te beantwoorden. Uw antwoord wordt eerst door onze moderatoren gecontroleerd en verschijnt daarna openbaar bij de vraag op ${env.ORIGIN}/vragen/${question.slug}.`,
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
		`Goed nieuws! Je vraag op VraagHetZe is geaccepteerd en doorgestuurd naar ${politician.name}. Je vraag staat nu openbaar op ${env.ORIGIN}/vragen/${question.slug} en je vindt je vraag ook terug onder "Mijn vragen" in het menu.`,
		`Wij hopen dat je snel een reactie ontvangt via ons platform. Als dit langer dan twee weken duurt zullen we één keer een herinneringsmail sturen naar ${politician.name}.`,
		`Het kan gebeuren dat het Kamerlid niet reageert. We hebben geen invloed op het reactiegedrag van Kamerleden, dit mogen zij zelf bepalen. De vraag blijft wel open staan op het platform en het wordt zichtbaar in het profiel van het Kamerlid dat zij een vraag niet hebben beantwoord.`,
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

	const [politician] = await tx
		.select({ name: schema.user.name, email: schema.user.email })
		.from(schema.user)
		.where(eq(schema.user.id, question.assigneeId))
		.limit(1);

	const body = [
		`Beste ${asker.name},`,
		`Bedankt voor je vraag "${question.title}" aan ${politician.name} op VraagHetZe`,
		`Na controle voldoet je vraag helaas niet aan onze moderatierichtlijnen`,
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

// enqueues the same notification to everyone following the question
export async function enqueueFollowerMails(tx: Transaction, question: AnsweredQuestion) {
	const followers = await tx
		.select({ name: schema.user.name, email: schema.user.email })
		.from(schema.questionFollow)
		.innerJoin(schema.user, eq(schema.questionFollow.userId, schema.user.id))
		.where(eq(schema.questionFollow.questionId, question.id));

	for (const follower of followers) {
		const body = [
			`Beste ${follower.name},`,
			`De vraag "${question.title}" die je volgt is beantwoord door ${question.politicianName}. Je kunt het antwoord lezen op ${env.ORIGIN}/vragen/${question.slug}.`,
			`Met vriendelijke groet,\nHet VraagHetZe-team`
		].join('\n\n');

		await enqueueMail({
			kind: 'follow-notification',
			questionId: question.id,
			recipient: follower.email,
			subject: 'Een vraag die je volgt is beantwoord',
			body,
			transaction: tx
		});
	}
}
