import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, schema } from '$lib/server/db';
import { resolveMailAddress } from './templates';
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
		return settle(mail, 'ignored', 'Geen antwoordtoken in adres');
	}

	if (isAutoReply(email.headers) || email.envelope.from === '') {
		return settle(mail, 'ignored', 'Automatisch antwoord');
	}

	if (!mail.dkimVerified) {
		return settle(mail, 'ignored', 'Afzender niet geverifieerd');
	}

	const [question] = await db
		.select({
			id: schema.question.id,
			status: schema.question.status,
			assigneeId: schema.question.assigneeId,
			politicianEmail: politicianUser.email
		})
		.from(schema.question)
		.innerJoin(politicianUser, eq(schema.question.assigneeId, politicianUser.id))
		.where(eq(schema.question.emailToken, mail.token))
		.limit(1);

	if (!question) {
		return settle(mail, 'ignored', `Vraag onbekend (id=${mail.token})`);
	}

	if (question.status !== 'approved') {
		return settle(mail, 'ignored', `Vraag niet goedgekeurd (status=${question.status})`);
	}

	const [publishedAnswer] = await db
		.select({ id: schema.answer.id })
		.from(schema.answer)
		.where(and(eq(schema.answer.questionId, question.id), eq(schema.answer.status, 'approved')))
		.limit(1);

	if (publishedAnswer) {
		return settle(mail, 'ignored', `Vraag al beantwoord (id=${publishedAnswer.id})`);
	}

	if (mail.fromAddress !== resolveMailAddress(question.politicianEmail).toLowerCase()) {
		return settle(mail, 'ignored', `Afzender is niet het Kamerlid (${mail.fromAddress} versus ${resolveMailAddress(question.politicianEmail).toLowerCase()})`);
	}

	const replyText = extractReplyText(email.text);

	if (!replyText) {
		return settle(mail, 'ignored', 'Leeg antwoord');
	}

	await db.transaction(async (tx) => {
		const answerId = crypto.randomUUID();

		// a politician often sends an automatic reply before the real one and the two can't be
		// told apart reliably, so the answer waits for a moderator instead of going public
		await tx.insert(schema.answer).values({
			id: answerId,
			questionId: question.id,
			userId: question.assigneeId,
			body: replyText
		});

		await tx
			.update(schema.inbox)
			.set({ status: 'processed', reason: null, answerId, processedAt: new Date() })
			.where(eq(schema.inbox.id, mail.id));
	});
}

function settle(mail: InboxRow, status: 'ignored' | 'failed', reason: string) {
	return db
		.update(schema.inbox)
		.set({ status, reason, processedAt: new Date() })
		.where(eq(schema.inbox.id, mail.id));
}
