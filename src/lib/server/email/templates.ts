import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db, schema, type Transaction } from '$lib/server/db';
import { enqueueMail, sendMail } from './outbox';
import MagicLinkConfirm from './templates/magic-link-confirm.svelte';
import MagicLinkFollow from './templates/magic-link-follow.svelte';
import MagicLinkLogin from './templates/magic-link-login.svelte';
import QuestionConfirmation from './templates/question-confirmation.svelte';
import QuestionPolitician from './templates/question-politician.svelte';
import QuestionApproved from './templates/question-approved.svelte';
import QuestionRejected from './templates/question-rejected.svelte';
import QuestionAnswered from './templates/question-answered.svelte';
import QuestionAnsweredFollowers from './templates/question-answered-followers.svelte';
import { render } from 'svelte/server';

// pre-launch safety: when DIVERSION_EMAIL is set, all politician-facing mail goes to
// that address and replies from it are accepted as if from the assigned politician
export const resolveMailAddress = (address: string) => env.DIVERSION_EMAIL || address;

const stripComments = (body: string) => {
	return body.replace(/<!--[\[\]]*-->/g, '');
}

// the sign-in link is worded after the flow it was requested from
const magicLinkCopy = {
	confirm: (url: string) => ({
		subject: 'Bevestig je vraag op VraagHetZe',
		body: stripComments(render(MagicLinkConfirm, { props: {url: url}}).body)
	}),
	follow: (url: string) => ({
		subject: 'Volg een vraag op VraagHetZe',
		body: stripComments(render(MagicLinkFollow, { props: {url: url}}).body)
	}),
	login: (url: string) => ({
		subject: 'Je inloglink voor VraagHetZe',
		body: stripComments(render(MagicLinkLogin, { props: {url: url}}).body)
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
		questionUrl: `${env.ORIGIN}/vragen/${question.slug}`,
		moderationUrl: `${env.ORIGIN}/moderatie`
	}});

	return sendMail({
		kind: 'question-confirmation',
		questionId: question.id,
		recipient: asker.email,
		subject: 'We hebben je vraag op VraagHetZe ontvangen',
		body: stripComments(result.body)
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

	const resultPolitician = render(QuestionPolitician, { props: {
		askerName: asker.name,
		politicianName: politician.name,
		questionTitle: question.title,
		questionBody: question.body,
		questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
	}});

	await enqueueMail({
		kind: 'question-notification',
		questionId: question.id,
		recipient: resolveMailAddress(politician.email),
		replyTo: `antwoord+${question.emailToken}@${env.EMAIL_DOMAIN}`,
		subject: `Nieuwe vraag via VraagHetZe van ${asker.name}`,
		body: stripComments(resultPolitician.body),
		transaction: tx
	});

	const resultAsker = render(QuestionApproved, { props: {
		askerName: asker.name,
		politicianName: politician.name,
		questionTitle: question.title,
		questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
	}});

	await enqueueMail({
		kind: 'moderation-notification',
		questionId: question.id,
		recipient: asker.email,
		subject: 'Je vraag op VraagHetZe is goedgekeurd',
		body: stripComments(resultAsker.body),
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

	const result = render(QuestionRejected, { props: {
		askerName: asker.name,
		politicianName: politician.name,
		questionTitle: question.title,
		questionBody: question.body
	}});

	return enqueueMail({
		kind: 'moderation-notification',
		questionId: question.id,
		recipient: asker.email,
		subject: 'Je vraag op VraagHetZe is niet goedgekeurd',
		body: stripComments(result.body),
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
	const result = render(QuestionAnswered, { props: {
		askerName: question.askerName,
		politicianName: question.politicianName,
		questionTitle: question.title,
		questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
	}});

	return enqueueMail({
		kind: 'answer-notification',
		questionId: question.id,
		recipient: question.askerEmail,
		subject: 'Je vraag op VraagHetZe is beantwoord',
		body: stripComments(result.body),
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
		const result = render(QuestionAnsweredFollowers, { props: {
			followerName: follower.name,
			politicianName: question.politicianName,
			questionTitle: question.title,
			questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
		}});

		await enqueueMail({
			kind: 'follow-notification',
			questionId: question.id,
			recipient: follower.email,
			subject: 'Een vraag die je volgt is beantwoord',
			body: stripComments(result.body),
			transaction: tx
		});
	}
}
