import { eq } from 'drizzle-orm';
import { db, schema } from '$lib/server/db';
import { MAGIC_LINK_EXPIRY } from './server/auth';
import * as InloggenPage from '$routes/inloggen/+page.server';
import * as VraagGegevensPage from '$routes/vragen/stellen/gegevens/+page.server';


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

export async function createAnswerAndQuestion(overrides: Partial<typeof schema.answer.$inferInsert> = {}) {
  const { question } = await createQuestion({status: 'approved'})
  const answer = await createAnswer(question, overrides);

  return answer;
}

export async function createSession(user_id: string, token: string, overrides: Partial<typeof schema.session.$inferInsert> = {}) {
	const [created] = await db
		.insert(schema.session)
		.values({
      id: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY),
      token,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user_id,
      ...overrides
    })
		.returning();

	return created;
}

export async function createVerification(token: string, email: string, overrides: Partial<typeof schema.verification.$inferInsert> = {}) {
	const [created] = await db
		.insert(schema.verification)
		.values({
      id: crypto.randomUUID(),
      identifier: token,
      value: `{"email":"${email}"}`,
      expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    })
		.returning();

	return created;
}

export async function getUser(userId: string) {
  const [user] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, userId));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email));
  return user;
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

export async function getVerificationForEmail(email: string) {
  return db
    .select()
    .from(schema.verification)
    .where(eq(schema.verification.value, `{"email":"${email}"}`));
}

export function createCookiesStub(initialCookies = {}) {
  const store = new Map(Object.entries(initialCookies));

  return {
    get: (name: string) => store.get(name),
    getAll: () => Array.from(store.entries()).map(([name, value]) => ({ name, value })),
    set: (name: string, value: string) => {
      store.set(name, String(value));
    },
    delete: (name: string) => {
      store.delete(name);
    }
  };
}

export function makeActionEvent<T extends (...args: any) => any>(
  url: string,
  user: typeof schema.user.$inferSelect | null,
  fields: Record<string, string> = {},
  slug?: string
) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) formData.set(name, value);

  const result =  {
    locals: { user: user ?? undefined },
    url: new URL(url),
    request: new Request(url, { method: 'POST', body: formData }),
    cookies: createCookiesStub()
  } as unknown as Parameters<T>[0];
  if (slug) {
      result.params = { slug }
  }

  return result;
}

export async function statusOf(handlerResult: unknown) {
  const outcome = await Promise.resolve(handlerResult).catch((thrown) => thrown);
  return (outcome as { status?: number } | null)?.status ?? 200;
}

export type registerActionEventOptions = {
	acceptTandC?: string;
	ageChecked?: string;
	setConfirmationEmail?: boolean;
}

export function registerMakeActionEvent(
  user: typeof schema.user.$inferSelect | null,
  fields: Record<string, string> = {},
  allOptions: registerActionEventOptions = {},
  addCapToken: boolean,
  page: typeof InloggenPage | typeof VraagGegevensPage,
  url: string
) {
  let { setConfirmationEmail, ...options } = allOptions;
  if (typeof setConfirmationEmail === 'undefined') setConfirmationEmail = true;
  if (typeof options.acceptTandC === 'undefined') options.acceptTandC = '1';
  if (typeof options.ageChecked === 'undefined') options.ageChecked = '1';

  fields['emailConfirmation'] = setConfirmationEmail ? fields['email'] : `${crypto.randomUUID()}@test.example`;

  const capField: { capToken: string } | {} = addCapToken ? { capToken: 'a_cap_token' } : {}
  const useFields = {
    ...fields,
    ...options,
    ...capField
  }

  return makeActionEvent<typeof page.actions.default>(
    url,
    user,
    useFields
  );
}
