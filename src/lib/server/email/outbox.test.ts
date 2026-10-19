import { beforeEach, describe, expect, test, vi } from 'vitest';
import { eq, inArray } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import { deliverOutbox, enqueueMail, sendMail, sendReminders } from './outbox';
import { createQuestionApproved } from '../reminders.test';
import { createPolitician, createUser, getQuestion, updateQuestion } from '$lib/test-utils';
import { env } from '$env/dynamic/private';

vi.mock('$app/environment', () => ({ dev: false }));

const testEnv = vi.hoisted(() => ({
	SENDGRID_API_KEY: 'test-sleutel',
	EMAIL_DOMAIN: 'test.example',
	EMAIL_INBOX: 'inbox@test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

beforeEach(async () => {
	fetchMock.mockReset();
	fetchMock.mockResolvedValue(new Response('', { status: 202 }));

	await db.delete(schema.outbox);
});

function makeMail(overrides: Partial<Parameters<typeof enqueueMail>[0]> = {}) {
	return {
		kind: 'magic-link' as const,
		recipient: `${crypto.randomUUID()}@test.example`,
		subject: 'Testmail',
		body: 'Inhoud van de mail.',
		...overrides
	};
}

async function getMailRow(recipient: string) {
	const [row] = await db.select().from(schema.outbox).where(eq(schema.outbox.recipient, recipient));
	return row;
}

describe('enqueueMail', () => {
	test('inserts a queued mail', async () => {
		const mail = makeMail();

		const mailId = await enqueueMail(mail);

		const row = await getMailRow(mail.recipient);

		expect(row).toMatchObject({
			id: mailId,
			kind: 'magic-link',
			subject: mail.subject,
			body: mail.body,
			status: 'queued',
			attempts: 0,
			lastError: null
		});
	});

	test('rolls back with the surrounding transaction', async () => {
		const mail = makeMail();

		await expect(
			db.transaction(async (tx) => {
				await enqueueMail({ ...mail, transaction: tx });
				tx.rollback();
			})
		).rejects.toThrow();

		expect(await getMailRow(mail.recipient)).toBeUndefined();
	});
});

describe('sendMail', () => {
	test('delivers the mail through SendGrid and marks it sent', async () => {
		const mail = makeMail({ replyTo: 'antwoord+3f2a@test.example' });

		const sent = await sendMail(mail);

		expect(sent).toBe(true);
		const row = await getMailRow(mail.recipient);
		expect(row).toMatchObject({ status: 'sent', attempts: 1 });
		expect(row.sentAt).not.toBeNull();

		const [url, request] = fetchMock.mock.calls[0];
		expect(url).toBe('https://api.sendgrid.com/v3/mail/send');
		expect(request.headers.Authorization).toBe('Bearer test-sleutel');

		const payload = JSON.parse(request.body);
		expect(payload.personalizations).toEqual([{ to: [{ email: mail.recipient }] }]);
		expect(payload.reply_to).toEqual({ email: mail.replyTo });
		expect(payload.from).toEqual({ name: 'VraagHetZe', email: `noreply@${env.EMAIL_DOMAIN}` });
		expect(payload.subject).toBe(mail.subject);
		expect(payload.content).toEqual([{ type: 'text/plain', value: mail.body }]);
	});

	test('sets a replyable From address when sending a notification to politician', async () => {
		const mail = makeMail({ replyTo: 'antwoord+3f2a@test.example', kind: 'question-notification' });

		const sent = await sendMail(mail);

		expect(sent).toBe(true);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [ url, request] = fetchMock.mock.calls[0];

		const payload = JSON.parse(request.body);
		expect(payload.personalizations).toEqual([{ to: [{ email: mail.recipient }] }]);
		expect(payload.reply_to).toEqual({ email: mail.replyTo });
		expect(payload.from).toEqual({ name: 'VraagHetZe', email: mail.replyTo });
	});

	test('sets a replyable From address when sending a reminder to politician', async () => {
		const mail = makeMail({ replyTo: 'antwoord+3f2a@test.example', kind: 'question-reminder' });

		const sent = await sendMail(mail);

		expect(sent).toBe(true);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [ url, request] = fetchMock.mock.calls[0];

		const payload = JSON.parse(request.body);
		expect(payload.personalizations).toEqual([{ to: [{ email: mail.recipient }] }]);
		expect(payload.reply_to).toEqual({ email: mail.replyTo });
		expect(payload.from).toEqual({ name: 'VraagHetZe', email: mail.replyTo });
	});

	test('requeues a rejected mail with backoff and error and reports it unsent', async () => {
		fetchMock.mockResolvedValueOnce(new Response('kapot', { status: 500 }));
		const mail = makeMail();

		const sent = await sendMail(mail);

		expect(sent).toBe(false);
		const row = await getMailRow(mail.recipient);
		expect(row).toMatchObject({ status: 'queued', attempts: 1 });
		expect(row.lastError).toContain('500 kapot');
		expect(row.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
	});

	test('fails an expired mail without contacting SendGrid', async () => {
		const mail = makeMail({ expiresAt: new Date(Date.now() - 1000) });

		const sent = await sendMail(mail);

		expect(sent).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
		const row = await getMailRow(mail.recipient);
		expect(row).toMatchObject({ status: 'failed', lastError: 'verlopen', attempts: 0 });
	});
});

describe('deliverOutbox', () => {
	test('drains the queue across multiple claim batches', async () => {
		const recipients = [];
		for (let index = 0; index < 11; index++) {
			const mail = makeMail();
			recipients.push(mail.recipient);
			await enqueueMail(mail);
		}

		const delivered = await deliverOutbox();

		expect(delivered).toBe(11);
		const rows = await db
			.select()
			.from(schema.outbox)
			.where(inArray(schema.outbox.recipient, recipients));
		expect(rows).toHaveLength(11);
		expect(rows.filter((row) => row.status === 'sent' && row.attempts === 1)).toHaveLength(11);
	});

	test('fails a mail permanently once the attempt limit is reached', async () => {
		fetchMock.mockResolvedValue(new Response('kapot', { status: 500 }));
		const mail = makeMail();
		const mailId = await enqueueMail(mail);
		await db.update(schema.outbox).set({ attempts: 7 }).where(eq(schema.outbox.id, mailId));

		const delivered = await deliverOutbox();

		expect(delivered).toBe(0);
		const row = await getMailRow(mail.recipient);
		expect(row).toMatchObject({ status: 'failed', attempts: 8 });
		expect(row.lastError).toContain('500 kapot');
	});

	test('continues draining past a claim batch of only expired mails', async () => {
		for (let index = 0; index < 10; index++) {
			await enqueueMail(makeMail({ expiresAt: new Date(Date.now() - 1000) }));
		}
		const mail = makeMail();
		await enqueueMail(mail);

		const delivered = await deliverOutbox();

		expect(delivered).toBe(1);
		const row = await getMailRow(mail.recipient);
		expect(row).toMatchObject({ status: 'sent' });
		const failed = await db.select().from(schema.outbox).where(eq(schema.outbox.status, 'failed'));
		expect(failed).toHaveLength(10);
	});
});

describe('sendReminders', () => {
	test('queues reminders for questions in outbox', async () => {
		const moderator = await createUser('Mo Moderator');

		const recipients = [];
		const questions = [];
		for (let index = 0; index < 4; index++) {
			const { politicianUser } = await createPolitician();
			const asker = await createUser('Vera Vraagsteller');
			const { question } = await createQuestionApproved({ asker, politicianUser, moderator, overdue: true });
			questions.push(question);
			recipients.push(politicianUser.email);
		}

		await sendReminders();

		const rows = await db
			.select()
			.from(schema.outbox)
			.where(inArray(schema.outbox.recipient, recipients));
		expect(rows).toHaveLength(4);
		expect(rows.filter((row) => row.status === 'queued' && row.attempts === 0)).toHaveLength(4);
		for (const question of questions) {
			expect((await getQuestion(question.id)).remindedAt).not.toBeNull();
		}
	});

	test('set the right properties', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const moderator = await createUser('Mo Moderator');

		const { question } = await createQuestionApproved({ asker, politicianUser, moderator, overdue: true });

		await sendReminders();

		const reminder = (await db
			.select()
			.from(schema.outbox)
			.where(eq(schema.outbox.recipient, politicianUser.email)))[0];
		expect(reminder.kind).toBe('question-reminder');
		expect(reminder.questionId).toBe(question.id);
		expect(reminder.recipient).toBe(`${politicianUser.id}@test.example`);
		expect(reminder.replyTo).toBe(`antwoord+${question.emailToken}@test.example`);
		expect(reminder.subject).toBe(`Herinnering: de vraag van ${asker.name} op VraagHetZe is nog onbeantwoord`);
	});

	test('does not send reminders if reminded_at already set', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const moderator = await createUser('Mo Moderator');

		const { question } = await createQuestionApproved({ asker, politicianUser, moderator, overdue: true });
		await updateQuestion(question.id, { remindedAt: new Date() });

		await sendReminders();

		const rows = await db
			.select()
			.from(schema.outbox);
		expect(rows).toHaveLength(0);
	});
});
