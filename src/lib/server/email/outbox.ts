import { and, eq, inArray, lt, lte, sql } from 'drizzle-orm';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { db, schema, type Transaction } from '../db';
import type { OutboxKind } from '../db/app.schema';

const MAX_ATTEMPTS = 8;
const CLAIM_BATCH_SIZE = 10;

type OutgoingMailOptions = {
	kind: OutboxKind;
	questionId?: string;
	recipient: string;
	replyTo?: string;
	subject: string;
	body: string;
	expiresAt?: Date;
	transaction?: Transaction;
};

export async function enqueueMail({ transaction, ...mail }: OutgoingMailOptions) {
	const id = crypto.randomUUID();

	await (transaction ?? db).insert(schema.outbox).values({ id, ...mail });

	return id;
}

export async function sendMail(mail: OutgoingMailOptions) {
	const mailId = await enqueueMail(mail);

	const { sent } = await deliverBatch([mailId]).catch((cause) => {
		console.error('Outbox delivery failed:', cause);
		return { claimed: 0, sent: 0 };
	});

	return sent > 0;
}

// exponential backoff in SQL using each mail's attempt count, max 4 hours
const backoff = sql`now() + least(pow(2, ${schema.outbox.attempts}) * interval '5 minutes', interval '4 hours')`;

async function deliverBatch(filterMailIds: string[] = []) {
	const { claimed, mails } = await db.transaction(async (tx) => {
		const now = new Date();

		const candidates = await tx
			.select({ id: schema.outbox.id, expiresAt: schema.outbox.expiresAt })
			.from(schema.outbox)
			.where(
				and(
					filterMailIds.length > 0 ? inArray(schema.outbox.id, filterMailIds) : undefined,
					inArray(schema.outbox.status, ['queued', 'sending']),
					lte(schema.outbox.nextAttemptAt, now),
					lt(schema.outbox.attempts, MAX_ATTEMPTS)
				)
			)
			.limit(CLAIM_BATCH_SIZE)
			.for('update', { skipLocked: true });

		const [expired, deliverable] = [
			candidates.filter((row) => row.expiresAt && row.expiresAt <= now),
			candidates.filter((row) => !row.expiresAt || row.expiresAt > now)
		];

		if (expired.length > 0) {
			await tx
				.update(schema.outbox)
				.set({ status: 'failed', lastError: 'verlopen' })
				.where(
					inArray(
						schema.outbox.id,
						expired.map((row) => row.id)
					)
				);
		}

		if (deliverable.length === 0) return { claimed: candidates.length, mails: [] };

		const mails = await tx
			.update(schema.outbox)
			.set({
				status: 'sending',
				attempts: sql`${schema.outbox.attempts} + 1`,
				nextAttemptAt: backoff
			})
			.where(
				inArray(
					schema.outbox.id,
					deliverable.map((row) => row.id)
				)
			)
			.returning();

		return { claimed: candidates.length, mails };
	});

	let sent = 0;

	for (const mail of mails) {
		try {
			await postEmail({
				to: mail.recipient,
				subject: mail.subject,
				text: mail.body,
				replyTo: mail.replyTo ?? undefined
			});
			await db
				.update(schema.outbox)
				.set({ status: 'sent', sentAt: new Date() })
				.where(eq(schema.outbox.id, mail.id));
			sent += 1;
		} catch (cause) {
			const lastError = cause instanceof Error ? cause.message : String(cause);
			// on a retryable failure the row goes back to 'queued' and is re-picked once its
			// nextAttemptAt passes; after the attempts limit it fails. rows left 'sending' by
			// a crash mid-send recover the same way, since the claim includes both statuses.
			await db
				.update(schema.outbox)
				.set(
					mail.attempts >= MAX_ATTEMPTS
						? { status: 'failed', lastError }
						: { status: 'queued', lastError }
				)
				.where(eq(schema.outbox.id, mail.id));
		}
	}

	return { claimed, sent };
}

export async function deliverOutbox() {
	let delivered = 0;
	let batch;
	do {
		batch = await deliverBatch();
		delivered += batch.sent;
	} while (batch.claimed === CLAIM_BATCH_SIZE);
	return delivered;
}

type EmailOptions = {
	to: string;
	subject: string;
	text: string;
	replyTo?: string;
};

async function postEmail({ to, subject, text, replyTo }: EmailOptions) {
	if (dev) {
		console.log(`Email to ${to} (reply-to ${replyTo ?? env.EMAIL_INBOX}): ${subject}\n${text}`);
		return;
	}

	const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			personalizations: [{ to: [{ email: to }] }],
			from: { name: 'VraagHetZe', email: `noreply@${env.EMAIL_DOMAIN}` },
			reply_to: { email: replyTo ?? env.EMAIL_INBOX },
			subject,
			content: [{ type: 'text/plain', value: text }]
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to send email: ${response.status} ${await response.text()}`);
	}
}
