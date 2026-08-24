import { beforeEach, describe, expect, test } from 'vitest';
import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import * as follows from './follows';
import { createPolitician, createUser } from '$lib/test-utils';

async function insertQuestion(
	askerId: string,
	assigneeId: string,
	overrides: Partial<typeof schema.question.$inferInsert> = {}
) {
	const id = crypto.randomUUID();

	const [question] = await db
		.insert(schema.question)
		.values({
			id,
			userId: askerId,
			assigneeId,
			title: 'Wat vindt u van de toeslagen?',
			body: 'Graag een toelichting.',
			slug: `testvraag-${id}`,
			status: 'approved',
			verifiedAt: new Date(),
			...overrides
		})
		.returning();

	return question;
}

async function insertAnswer(
	questionId: string,
	assigneeId: string,
	overrides: Partial<typeof schema.answer.$inferInsert> = {}
) {
	await db.insert(schema.answer).values({
		id: crypto.randomUUID(),
		questionId,
		userId: assigneeId,
		body: 'Mijn antwoord op uw vraag.',
		status: 'approved',
		...overrides
	});
}

function listFollows(questionId: string) {
	return db
		.select()
		.from(schema.questionFollow)
		.where(eq(schema.questionFollow.questionId, questionId));
}

beforeEach(async () => {
	await db.transaction(async (tx) => {
		await tx.delete(schema.questionFollow);
		await tx.delete(schema.answer);
		await tx.delete(schema.question);
		await tx.delete(schema.user);
		await tx.delete(schema.fraction);
	});
});

describe('follow', () => {
	test('follows a published question', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const result = await follows.follow(question.slug, follower.id);

		expect(result).toEqual({ followed: true });
		expect(await listFollows(question.id)).toHaveLength(1);
	});

	test('keeps a second press on the bell a single follow', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);

		await follows.follow(question.slug, follower.id);
		await follows.follow(question.slug, follower.id);

		expect(await listFollows(question.id)).toHaveLength(1);
	});

	test('refuses the asker their own question', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);

		const result = await follows.follow(question.slug, asker.id);

		expect(result).toEqual({ error: 'own-question' });
		expect(await listFollows(question.id)).toHaveLength(0);
	});

	test('refuses an answered question', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await insertAnswer(question.id, politicianUser.id);

		const result = await follows.follow(question.slug, follower.id);

		expect(result).toEqual({ error: 'already-answered' });
		expect(await listFollows(question.id)).toHaveLength(0);
	});

	test('ignores an answer that is still waiting for moderation', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await insertAnswer(question.id, politicianUser.id, { status: 'pending' });

		const result = await follows.follow(question.slug, follower.id);

		expect(result).toEqual({ followed: true });
	});

	test('hides an unpublished question behind the same error as a missing one', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const pending = await insertQuestion(asker.id, politicianUser.id, { status: 'pending' });

		expect(await follows.follow(pending.slug, follower.id)).toEqual({ error: 'unknown-question' });
		expect(await follows.follow('bestaat-niet', follower.id)).toEqual({
			error: 'unknown-question'
		});
	});
});

describe('unfollow', () => {
	test('removes the follow', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await follows.follow(question.slug, follower.id);

		const removed = await follows.unfollow(question.slug, follower.id);

		expect(removed).toBe(true);
		expect(await listFollows(question.id)).toHaveLength(0);
	});

	test('removes an answered question from the bookmarks', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await follows.follow(question.slug, follower.id);
		await insertAnswer(question.id, politicianUser.id);

		expect(await follows.unfollow(question.slug, follower.id)).toBe(true);
	});

	test('leaves the follows of others alone', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const stranger = await createUser('Sjaak Stranger');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await follows.follow(question.slug, follower.id);

		expect(await follows.unfollow(question.slug, stranger.id)).toBe(false);
		expect(await listFollows(question.id)).toHaveLength(1);
	});
});

describe('countForQuestion', () => {
	test('counts the asker as a follower', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const question = await insertQuestion(asker.id, politicianUser.id);

		expect(await follows.countForQuestion(question.id, null)).toEqual({
			followers: 1,
			isFollowing: false
		});
	});

	test('counts every follower and reports the viewer their own state', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const stranger = await createUser('Sjaak Stranger');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await follows.follow(question.slug, follower.id);
		await follows.follow(question.slug, stranger.id);

		expect(await follows.countForQuestion(question.id, follower.id)).toEqual({
			followers: 3,
			isFollowing: true
		});
		expect(await follows.countForQuestion(question.id, asker.id)).toEqual({
			followers: 3,
			isFollowing: false
		});
	});
});

describe('listForUser', () => {
	test('lists followed questions, answered ones included', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const answered = await insertQuestion(asker.id, politicianUser.id);
		const open = await insertQuestion(asker.id, politicianUser.id);

		await follows.follow(answered.slug, follower.id);
		await insertAnswer(answered.id, politicianUser.id);
		await follows.follow(open.slug, follower.id);

		const followed = await follows.listForUser(follower.id);

		expect(followed.map((question) => question.slug)).toEqual([open.slug, answered.slug]);
		expect(followed[1].answer).toMatchObject({ body: 'Mijn antwoord op uw vraag.' });
	});

	test('leaves out what the user does not follow', async () => {
		const { politicianUser } = await createPolitician();
		const asker = await createUser('Vera Vraagsteller');
		const follower = await createUser('Fatima Volger');
		const question = await insertQuestion(asker.id, politicianUser.id);
		await insertQuestion(asker.id, politicianUser.id);

		await follows.follow(question.slug, follower.id);

		const followed = await follows.listForUser(follower.id);

		expect(followed.map((question) => question.slug)).toEqual([question.slug]);
	});
});
