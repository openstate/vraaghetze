import { db, schema } from '$lib/server/db';
import { readFileSync, writeFileSync } from 'fs';
import { desc, eq } from 'drizzle-orm';
import type { Page } from '@playwright/test';

export const testBeforeEach = async (page: Page) => {
	await db.delete(schema.moderationAction);
	await db.delete(schema.answer);
	await db.delete(schema.question);
	await db.delete(schema.session);
	await page.setViewportSize({ width: 1280, height: 1200 });
};

export async function createQuestion(
	asker: typeof schema.user.$inferInsert,
	politician: typeof schema.user.$inferInsert,
	overrides: Partial<typeof schema.question.$inferInsert> = {}
) {
	const id = crypto.randomUUID();

	const [question] = await db
		.insert(schema.question)
		.values({
			id,
			userId: asker.id,
			assigneeId: politician.id,
			title: 'Wat vindt u van de toeslagen?',
			body: 'Graag een toelichting.',
			slug: `testvraag-${id}`,
			verifiedAt: new Date(),
			...overrides
		})
		.returning();

	return question;
}
export async function createAnswer(
	question: { id: string; assigneeId: string },
	overrides: Partial<typeof schema.answer.$inferInsert> = {}
) {
	const [answer] = await db
		.insert(schema.answer)
		.values({
			id: crypto.randomUUID(),
			questionId: question.id,
			userId: question.assigneeId,
			body: 'Mijn antwoord op uw vraag.',
			...overrides
		})
		.returning();

	return answer;
}

export async function getLastModerationActionForQuestion(questionId: string) {
	const [moderationAction] = await db
		.select()
		.from(schema.moderationAction)
		.where(eq(schema.moderationAction.questionId, questionId))
		.orderBy(desc(schema.moderationAction.createdAt))
		.limit(1);

	return moderationAction;
}

export async function getLastModerationActionForAnswer(answerId: string) {
	const [moderationAction] = await db
		.select()
		.from(schema.moderationAction)
		.where(eq(schema.moderationAction.answerId, answerId))
		.orderBy(desc(schema.moderationAction.createdAt))
		.limit(1);

	return moderationAction;
}

export async function getInboxEmail(sender: string) {
	const [stored] = await db.select().from(schema.inbox).where(eq(schema.inbox.fromAddress, sender));

	return stored;
}

async function getMagicLinkIdentifier(email: string) {
	const [row] = await db
		.select({ id: schema.verification.identifier })
		.from(schema.verification)
		.where(eq(schema.verification.value, `{"email":"${email}"}`))
		.limit(1);

	return row.id;
}

export async function getMagicLinkMail(email: string) {
	const magicLinkIdentifier = await getMagicLinkIdentifier(email);
	let contents = JSON.parse(
		readFileSync(`./test-results/mails/${magicLinkIdentifier}.json`).toString()
	);

	let match = /\s(http:\/\/127.0.0.1:4173\/api\/auth\/magic-link[^\s]+)\s/.exec(contents.body);
	if (match) {
		contents = { ...contents, magicLinkUrl: match[1] };
	}

	match = /\sHierbij de code om in te loggen:\s+([^\s]+)\s/.exec(contents.body);
	if (match) {
		contents = { ...contents, code: match[1] };
	}

	return contents;
}

export async function getEnqueuedMail(email: string) {
	const contents = JSON.parse(readFileSync(`./test-results/mails/${email}.json`).toString());

	return contents;
}

type CreateSendgridCurlScriptType = {
	filename: string;
	fromEmail: string;
	emailToken: string;
	subject?: string; // Specify either subject or subjectFilename
	subjectFilename?: string;
	text?: string; // specify either text or textFilename
	textFilename?: string;
	charsets?: { text?: string; subject?: string };
};

export const createSendgridCurlScript = (options: CreateSendgridCurlScriptType) => {
	const script =
		`#!/bin/bash
FROM_NAME="Jan Jansen"
FROM_DOMAIN=${options.fromEmail.split('@')[1]}
FROM_EMAIL="${options.fromEmail}"
EMAIL_TOKEN="${options.emailToken}"
SUBJECT=` +
		(options.subject ? `"${options.subject}"` : `\`cat ${options.subjectFilename}\``) +
		`
TEXT=` +
		(options.text ? `"${options.text}"` : `\`cat ${options.textFilename}\``) +
		`

# Get environment variables
source "${process.cwd()}/.env"

PARAMS=(
  -H 'Content-type: multipart/form-data'
  -F headers="From: $FROM_NAME <$FROM_EMAIL>"
  -F dkim="{@$FROM_DOMAIN : pass}"
  -F SPF=pass
  -F to="antwoord+$EMAIL_TOKEN@vraaghetze.nu"
  -F from="$FROM_NAME <$FROM_EMAIL>"
  -F subject="$SUBJECT"
  -F text="$TEXT"
  -F sender_ip=127.0.0.1
  -F envelope="{ \\"from\\": \\"$FROM_EMAIL\\", \\"to\\": [\\"antwoord+$EMAIL_TOKEN@vraaghetze.nu\\"] }"
  -F charsets="{ \\"to\\": \\"UTF-8\\", \\"subject\\": \\"${options.charsets?.subject ?? 'UTF-8'}\\", \\"text\\": \\"${options.charsets?.text ?? 'UTF-8'}\\" }"
)
curl -X POST "http://127.0.0.1:4173/api/sendgrid/inbound?token=$INBOUND_MAIL_TOKEN" "$\{PARAMS[@]}"`;

	const scriptName = `${process.cwd()}/test-results/bash-scripts/${options.filename}`;
	writeFileSync(scriptName, script, { mode: '555' });

	return scriptName;
};

type CreateEncodedTextFileType = {
	text: string;
	encoding: string;
	filename: string;
};

export const createEncodedTextFile = (options: CreateEncodedTextFileType) => {
	const textFilename = `${process.cwd()}/test-results/bash-scripts/${options.filename}.txt`;
	writeFileSync(textFilename, options.text, { encoding: options.encoding as BufferEncoding });

	return textFilename;
};
