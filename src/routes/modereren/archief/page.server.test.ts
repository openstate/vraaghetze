import { beforeEach, describe, expect, test, vi } from 'vitest';
import { schema } from '$lib/server/db';
import * as page from './+page.server';
import {
	createPolitician,
	createQuestionAndUsers,
	createUser,
	getQuestion,
	getQuestionAudit,
  makeActionEvent
} from '$lib/test-utils';
import { replyToForToken } from '$lib/server/email/templates';

const testEnv = vi.hoisted(() => ({
	DIVERSION_EMAIL: '',
	EMAIL_DOMAIN: 'test.example',
	ORIGIN: 'https://test.example'
}));

vi.mock('$env/dynamic/private', () => ({ env: testEnv }));

const enqueueMail = vi.hoisted(() => vi.fn());
enqueueMail.mockReturnValue(crypto.randomUUID());
vi.mock(import('$lib/server/email/outbox'), async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		enqueueMail
	};
});

function myMakeActionEvent(
  user: typeof schema.user.$inferSelect | null,
  fields: Record<string, string> = {}
) {
  return makeActionEvent<typeof page.actions.default>(`http://localhost/modereren/archief`, user, fields);
}

beforeEach(async () => {
	enqueueMail.mockClear();
});

describe('default action, proposing other politician', () => {
	test('stores information about politician selected by moderators', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question, politician } = await createQuestionAndUsers({ status: 'approved' });
		const otherPolitician = (await createPolitician('Other Politician')).politician;
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			selectedPoliticianSlug: otherPolitician.slug,
			action: 'change-politician'
		});
		expect(await getQuestion(question.id)).toMatchObject({
			status: 'approved',
			assigneeId: politician?.userId,
			assigneeFractionId: politician?.fractionId
		});

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: question.id });
		expect(await getQuestion(question.id)).toMatchObject({
			status: 'approved',
			assigneeId: otherPolitician.userId,
			assigneeFractionId: otherPolitician.fractionId
		});

		const audit = await getQuestionAudit(question.id);
		expect(audit.moderatorId).toBe(moderator.id);
		expect(audit.action).toBe('politician-changed');
		expect(audit.note).toBe(`Kamerlid door moderator aangepast van ${politician?.slug} naar ${otherPolitician.slug}.`);
		const expected = JSON.parse(`{"currentSlug": "${politician?.slug}", "newSlug": "${otherPolitician.slug}"}`);
		expect(audit.meta).toStrictEqual(expected);
	});

	test('does not normally send an email', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestionAndUsers({ status: 'approved' });
		const otherPolitician = (await createPolitician('Other Politician')).politician;
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			selectedPoliticianSlug: otherPolitician.slug,
			action: 'change-politician'
		});

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: question.id });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('sends an email when requested', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { asker, question } = await createQuestionAndUsers({ status: 'approved' });
		const { politician: otherPolitician, politicianUser: otherPoliticianUser} = await createPolitician('Other Politician');
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			selectedPoliticianSlug: otherPolitician.slug,
			action: 'change-politician',
			sendEmail: '1'
		});

		const result = await page.actions.default(event);

		expect(result).toEqual({ moderated: question.id });
		expect(enqueueMail).toHaveBeenCalled();

		const { kind, questionId, recipient, replyTo, subject } = enqueueMail.mock.calls[0][0]
		expect(kind).toBe('question-notification');
		expect(questionId).toBe(question.id);
		expect(recipient).toBe(otherPoliticianUser.email);
		expect(replyTo).toBe(replyToForToken(question.emailToken ?? ''));
		expect(subject).toBe(`Nieuwe vraag via VraagHetZe van ${asker.name}`);
	});

	test('requires a politician slug', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestionAndUsers({ status: 'approved' });
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			action: 'change-politician'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400 });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('validates that the slug exists', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestionAndUsers({ status: 'approved' });
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			selectedPoliticianSlug: 'just a non-existing slug',
			action: 'change-politician'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400, data: { error: 'Kamerlid bestaat niet.' } });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('validates that the question status is approved', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestionAndUsers({ status: 'answered' });
		const otherPolitician = (await createPolitician('Other Politician')).politician;
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			selectedPoliticianSlug: otherPolitician.slug,
			action: 'change-politician'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({ status: 400, data: { error: 'Vraag heeft niet de juiste status.' } });
		expect(await getQuestion(question.id)).toMatchObject({ status: 'answered' });
		expect(enqueueMail).not.toHaveBeenCalled();
	});

	test('validates that the politician accepts answers', async () => {
		const moderator = await createUser('Mo Moderator', { role: 'moderator' });
		const { question } = await createQuestionAndUsers({ status: 'approved' });
		const otherPolitician = (
			await createPolitician('Other Politician', { acceptsQuestions: false })
		).politician;
		const event = myMakeActionEvent(moderator, {
			questionId: question.id,
			selectedPoliticianSlug: otherPolitician.slug,
			action: 'change-politician'
		});

		const result = await page.actions.default(event);

		expect(result).toMatchObject({
			status: 400,
			data: {
				error: 'Dit Kamerlid heeft ervoor gekozen niet openbaar antwoord te geven via VraagHetZe.'
			}
		});
		expect(enqueueMail).not.toHaveBeenCalled();
	});
});
