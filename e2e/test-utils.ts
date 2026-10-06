import { db, schema } from '$lib/server/db';
import { readFileSync } from 'fs';
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

	let match = /\s(http:\/\/127.0.0.1:4173\/api\/auth\/magic-link[^\s]+)\.\s/.exec(contents.body);
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
	const contents = JSON.parse(
		readFileSync(`./test-results/mails/${email}.json`).toString()
	);

	return contents;
}
