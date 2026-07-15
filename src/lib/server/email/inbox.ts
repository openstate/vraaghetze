import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, schema } from '$lib/server/db';
import { enqueueAnswerMail, resolveMailAddress } from './templates';
import {
	dedupKey,
	extractAddress,
	extractReplyText,
	extractToken,
	isAutoReply,
	isSenderVerified,
	type InboundEmail
} from './parse-inbound';

const politicianUser = alias(schema.user, 'politicianUser');

type InboxRow = typeof schema.inbox.$inferSelect;

export async function receiveInboundEmail(email: InboundEmail) {
	// store first, process second
	const [stored] = await db
		.insert(schema.inbox)
		.values({
			id: crypto.randomUUID(),
			dedupKey: dedupKey(email),
			fromAddress: extractAddress(email.from),
			token: extractToken(email.envelope.to, email.to),
			subject: email.subject,
			dkimVerified: isSenderVerified(email),
			status: 'received',
			payload: email
		})
		.onConflictDoNothing({ target: schema.inbox.dedupKey })
		.returning();

	if (!stored) {
		return; // already in inbox
	}

	try {
		await processMail(stored);
	} catch (cause) {
		console.error('[sendgrid/inbound] verwerking mislukt:', cause);
		await settle(stored, 'failed', cause instanceof Error ? cause.message : String(cause));
	}
}

async function processMail(mail: InboxRow) {
	const email = mail.payload;

	if (!mail.token) {
		return settle(mail, 'review', 'geen antwoordtoken in adres');
	}

	if (isAutoReply(email.headers) || email.envelope.from === '') {
		return settle(mail, 'review', 'automatisch antwoord');
	}

	if (!mail.dkimVerified) {
		return settle(mail, 'review', 'afzender niet geverifieerd');
	}

	const [question] = await db
		.select({
			id: schema.question.id,
			slug: schema.question.slug,
			title: schema.question.title,
			status: schema.question.status,
			assigneeId: schema.question.assigneeId,
			politicianName: politicianUser.name,
			politicianEmail: politicianUser.email,
			askerName: schema.user.name,
			askerEmail: schema.user.email
		})
		.from(schema.question)
		.innerJoin(schema.user, eq(schema.question.userId, schema.user.id))
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.where(eq(schema.question.emailToken, mail.token))
		.limit(1);

	if (!question || question.status !== 'approved') {
		return settle(mail, 'review', 'token onbekend of vraag niet goedgekeurd');
	}

	const [publishedAnswer] = await db
		.select({ id: schema.answer.id })
		.from(schema.answer)
		.where(and(eq(schema.answer.questionId, question.id), eq(schema.answer.status, 'approved')))
		.limit(1);

	if (publishedAnswer) {
		return settle(mail, 'review', 'vraag is al beantwoord');
	}

	if (mail.fromAddress !== resolveMailAddress(question.politicianEmail).toLowerCase()) {
		return settle(mail, 'review', 'afzender is niet het Kamerlid');
	}

	const replyText = extractReplyText(email.text);

	if (!replyText) {
		return settle(mail, 'review', 'leeg antwoord');
	}

	await db.transaction(async (tx) => {
		const answerId = crypto.randomUUID();

		await tx.insert(schema.answer).values({
			id: answerId,
			questionId: question.id,
			userId: question.assigneeId,
			body: replyText,
			status: 'approved'
		});

		// notify the asker that their question has been answered
		await enqueueAnswerMail(tx, question);

		await tx
			.update(schema.inbox)
			.set({ status: 'processed', reason: null, answerId, processedAt: new Date() })
			.where(eq(schema.inbox.id, mail.id));
	});
}

function settle(mail: InboxRow, status: 'review' | 'failed', reason: string) {
	return db
		.update(schema.inbox)
		.set({ status, reason, processedAt: new Date() })
		.where(eq(schema.inbox.id, mail.id));
}
