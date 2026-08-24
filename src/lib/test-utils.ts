import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';


export async function createUser(name: string, overrides: Partial<typeof schema.user.$inferInsert> = {}) {
	const id = crypto.randomUUID();

	const [created] = await db
		.insert(schema.user)
		.values({ id, name, email: `${id}@test.example`, emailVerified: true, ...overrides })
		.returning();

	return created;
}

export async function createPolitician(
  name: string = 'Jan Jansen',
  overrides: Partial<typeof schema.politician.$inferInsert> = {}
) {
  const politicianUser = await createUser(name, { role: 'politician' });

  const fractionId = crypto.randomUUID();
  const [fraction] = await db
    .insert(schema.fraction)
    .values({ id: fractionId, slug: `tf-${fractionId}`, name: 'Testfractie', abbreviation: 'TF' })
    .returning();

  const id = crypto.randomUUID();
  const [politician] = await db
    .insert(schema.politician)
    .values({
      id,
      slug: `kamerlid-${id}`,
      userId: politicianUser.id,
      fractionId,
      fractionRole: 'member',
      ...overrides
    })
    .returning();

  return { politician, politicianUser, fraction };
}

export async function createQuestion(
  overrides: Partial<typeof schema.question.$inferInsert> = {},
	createPolitician: boolean = true
) {
  const asker = await createUser('Vera Vraagsteller');
  const politician = await createUser('Jan Jansen');

	if (createPolitician) {
    const fractionId = crypto.randomUUID();
    await db
      .insert(schema.fraction)
      .values({ id: fractionId, slug: `tf-${fractionId}`, name: 'Testfractie', abbreviation: 'TF' });

    const politicianId = crypto.randomUUID();
    await db.insert(schema.politician).values({
      id: politicianId,
      slug: `jan-jansen-${politicianId}`,
      userId: politician.id,
      fractionId,
      fractionRole: 'member'
    });
  }

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

  return { question, asker, politician };
}

export async function getQuestion(questionId: string) {
  const [question] = await db
    .select()
    .from(schema.question)
    .where(eq(schema.question.id, questionId));
  return question;
}

export async function getQuestionBySlug(slug: string) {
  const [question] = await db.select().from(schema.question).where(eq(schema.question.slug, slug));
  return question;
}

export async function getAnswer(answerId: string) {
  const [answer] = await db.select().from(schema.answer).where(eq(schema.answer.id, answerId));
  return answer;
}

export async function getAnswerAudit(answerId: string) {
  return db
    .select()
    .from(schema.moderationAction)
    .where(eq(schema.moderationAction.answerId, answerId));
}
