import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { schema, type Transaction } from '$lib/server/db';
import { enqueueMail, sendMail } from './outbox';
import MagicLinkConfirm from './templates/magic-link-confirm.svelte';
import MagicLinkFollow from './templates/magic-link-follow.svelte';
import MagicLinkLogin from './templates/magic-link-login.svelte';
import MagicLinkCode from './templates/magic-link-code.svelte';
import MagicLinkProposedPolitician from './templates/magic-link-proposed-politician.svelte';
import QuestionConfirmation from './templates/question-confirmation.svelte';
import QuestionPolitician from './templates/question-politician.svelte';
import QuestionApproved from './templates/question-approved.svelte';
import QuestionRejected from './templates/question-rejected.svelte';
import QuestionAnswered from './templates/question-answered.svelte';
import QuestionAnsweredFollowers from './templates/question-answered-followers.svelte';
import { render } from 'svelte/server';
import { rejectionReasonTexts } from '$lib/moderation';
import { MAGIC_LINK_EXPIRY_DAYS, sendSignInLink } from '../auth';
import { getBasicUserInfoById } from '../auth';
import type { PoliticianType } from '../politicians';

// pre-launch safety: when DIVERSION_EMAIL is set, all politician-facing mail goes to
// that address and replies from it are accepted as if from the assigned politician
export const resolveMailAddress = (address: string) => env.DIVERSION_EMAIL || address;

const stripComments = (body: string) => {
	return body.replace(/<!--[^-]*-->/g, '');
};

// the sign-in link is worded after the flow it was requested from
const magicLinkCopy = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	confirm: (url: string, metadata: Record<string, any>) => ({
		subject: 'Bevestig je vraag op VraagHetZe',
		body: stripComments(
			render(MagicLinkConfirm, { props: { url: url, valid: MAGIC_LINK_EXPIRY_DAYS } }).body
		)
	}),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	follow: (url: string, metadata: Record<string, any>) => ({
		subject: 'Volg een vraag op VraagHetZe',
		body: stripComments(render(MagicLinkFollow, { props: { url: url } }).body)
	}),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	login: (url: string, metadata: Record<string, any>) => ({
		subject: 'Je inloglink voor VraagHetZe',
		body: stripComments(render(MagicLinkLogin, { props: { url: url } }).body)
	}),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	sendCode: (code: string, metadata: Record<string, any>) => ({
		subject: 'Je inlogcode voor VraagHetZe',
		body: stripComments(render(MagicLinkCode, { props: { code: code } }).body)
	}),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	proposedPolitician: (url: string, metadata: Record<string, any>) => ({
		subject: 'Voorgestelde wijziging Kamerlid voor jouw vraag',
		body: stripComments(
			render(MagicLinkProposedPolitician, {
				props: {
					askerName: metadata.askerName,
					politicianName: metadata.politicianName,
					proposedPoliticianName: metadata.proposedPoliticianName,
					questionTitle: metadata.questionTitle,
					questionUrl: `${env.ORIGIN}/vragen/${metadata.questionSlug}`,
					approvalUrl: url,
					valid: MAGIC_LINK_EXPIRY_DAYS
				}
			}).body
		)
	})
};

export type MagicLinkPurpose = keyof typeof magicLinkCopy;

type MagicLink = {
	recipient: string;
	urlOrToken: string;
	purpose: MagicLinkPurpose;
	expiresAt: Date;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	metadata?: Record<string, any>;
};

export function sendMagicLinkMail({
	recipient,
	urlOrToken,
	purpose,
	expiresAt,
	metadata
}: MagicLink) {
	const { subject, body } = magicLinkCopy[purpose](urlOrToken, metadata ?? {});

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
	const asker = await getBasicUserInfoById(question.userId);

	const politician = await getBasicUserInfoById(question.assigneeId);

	const result = render(QuestionConfirmation, {
		props: {
			askerName: asker.name,
			politicianName: politician.name,
			questionTitle: question.title,
			questionUrl: `${env.ORIGIN}/vragen/${question.slug}`,
			moderationUrl: `${env.ORIGIN}/moderatie`
		}
	});

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
	const asker = await getBasicUserInfoById(question.userId, tx);

	const politician = await getBasicUserInfoById(question.assigneeId, tx);

	const resultPolitician = render(QuestionPolitician, {
		props: {
			askerName: asker.name,
			politicianName: politician.name,
			questionTitle: question.title,
			questionBody: question.body,
			questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
		}
	});

	await enqueueMail({
		kind: 'question-notification',
		questionId: question.id,
		recipient: resolveMailAddress(politician.email),
		replyTo: `antwoord+${question.emailToken}@${env.EMAIL_DOMAIN}`,
		subject: `Nieuwe vraag via VraagHetZe van ${asker.name}`,
		body: stripComments(resultPolitician.body),
		transaction: tx
	});

	const resultAsker = render(QuestionApproved, {
		props: {
			askerName: asker.name,
			politicianName: politician.name,
			questionTitle: question.title,
			questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
		}
	});

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
export async function enqueueRejectionMail(
	tx: Transaction,
	question: ModeratedQuestion,
	rejectionReason: string
) {
	const asker = await getBasicUserInfoById(question.userId, tx);

	const politician = await getBasicUserInfoById(question.assigneeId, tx);

	const result = render(QuestionRejected, {
		props: {
			askerName: asker.name,
			politicianName: politician.name,
			questionTitle: question.title,
			questionBody: question.body,
			moderationUrl: `${env.ORIGIN}/moderatie`,
			rejectionReasons: rejectionReasonTexts(rejectionReason)
		}
	});

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
	const result = render(QuestionAnswered, {
		props: {
			askerName: question.askerName,
			politicianName: question.politicianName,
			questionTitle: question.title,
			questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
		}
	});

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
		const result = render(QuestionAnsweredFollowers, {
			props: {
				followerName: follower.name,
				politicianName: question.politicianName,
				questionTitle: question.title,
				questionUrl: `${env.ORIGIN}/vragen/${question.slug}`
			}
		});

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

export async function sendProposedPoliticianMail(
	question: Pick<typeof schema.question.$inferInsert, 'userId' | 'assigneeId' | 'slug' | 'title'>,
	proposedPolitician: PoliticianType
) {
	const user = await getBasicUserInfoById(question.userId);
	const politician = await getBasicUserInfoById(question.assigneeId);
	const callback = new URL(`/vragen/${question.slug}`, process.env.ORIGIN);
	callback.searchParams.set('doel', 'kamerlid_wijzigen');
	const sendResult = await sendSignInLink(user.email, callback.toString(), {
		askerName: user.name,
		politicianName: politician.name,
		proposedPoliticianName: proposedPolitician.name,
		questionTitle: question.title,
		questionSlug: question.slug
	});

	if (sendResult.status == 'error') throw new Error('Error sending mail');
}
