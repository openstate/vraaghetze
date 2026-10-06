import { expect, signInAs, test } from './fixtures';
import { testAsker, testModerator, testPoliticianUser } from './data';
import { createQuestion, createAnswer, getLastModerationActionForAnswer, testBeforeEach } from './test-utils';

test.beforeEach(async ({ db, page }) => {
	await testBeforeEach(page);
});


test('a moderator can approve an answer in the list', async ({ context, page }) => {
	const question = await createQuestion(testAsker, testPoliticianUser);
	const answer = await createAnswer(question);

	await signInAs(context, testModerator.id);
	await page.goto('/modereren/antwoorden');

	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answer.body)).toBeVisible();
	await expect(page.getByText('Geen antwoorden in de wachtrij.')).not.toBeVisible();
	await page.getByRole('button', { name: 'Keur goed' }).click();

	await expect(page.getByText('Je hebt het antwoord goedgekeurd')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText('Geen antwoorden in de wachtrij.')).toBeVisible();
	await expect(page.getByText(answer.body)).not.toBeVisible();
});

test('a moderator can approve an answer from the slug page', async ({ context, page }) => {
	const question = await createQuestion(testAsker, testPoliticianUser);
	const answer = await createAnswer(question);

	await signInAs(context, testModerator.id);
	const returnTo = encodeURIComponent(`http://127.0.0.1:4173/modereren/inbox`);
	await page.goto(`/modereren/antwoorden/${answer.id}?returnTo=${returnTo}`);

	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answer.body)).toBeVisible();
	await expect(page.getByText('Geen antwoorden in de wachtrij.')).not.toBeVisible();
	await page.getByRole('button', { name: 'Keur goed' }).click();

	await expect(page.getByText('Je hebt het antwoord goedgekeurd')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answer.body)).not.toBeVisible();
});

test('a moderator can reject an answer in the list', async ({ context, page }) => {
	const question = await createQuestion(testAsker, testPoliticianUser);
	const answer = await createAnswer(question);

	await signInAs(context, testModerator.id);
	await page.goto('/modereren/antwoorden');

	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answer.body)).toBeVisible();
	await expect(page.getByText('Geen antwoorden in de wachtrij.')).not.toBeVisible();
	await page.getByRole('button', { name: 'Negeer' }).click();

	await expect(page.getByText('Je hebt het antwoord afgewezen')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText('Geen antwoorden in de wachtrij.')).toBeVisible();
	await expect(page.getByText(answer.body)).not.toBeVisible();
});

test('a moderator can reject an answer from the slug page', async ({ context, page }) => {
	const question = await createQuestion(testAsker, testPoliticianUser);
	const answer = await createAnswer(question);

	await signInAs(context, testModerator.id);
	const returnTo = encodeURIComponent(`http://127.0.0.1:4173/modereren/inbox`);
	await page.goto(`/modereren/antwoorden/${answer.id}?returnTo=${returnTo}`);

	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answer.body)).toBeVisible();
	await expect(page.getByText('Geen antwoorden in de wachtrij.')).not.toBeVisible();
	await page.getByRole('button', { name: 'Negeer' }).click();

	await expect(page.getByText('Je hebt het antwoord afgewezen')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answer.body)).not.toBeVisible();
});

test('a moderator can make a single redaction in the list', async ({ context, page }) => {
	const question = await createQuestion(testAsker, testPoliticianUser);
	const telephoneNumber = '06 12345678';
	const replaceText = '<verwijderd>';
	const answerBody = `This answer contains the private telephone number ${telephoneNumber} to be redacted.`;
	const redactedBody = `This answer contains the private telephone number ${replaceText} to be redacted.`;
	const answer = await createAnswer(question, { body: answerBody });

	await signInAs(context, testModerator.id);
	await page.goto('/modereren/antwoorden');

	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answerBody)).toBeVisible();
	await expect(page.getByText(redactedBody)).not.toBeVisible();
	await page.getByRole('button', { name: 'Redigeren' }).click();

	await expect(page.getByText('Originele tekst')).toBeVisible();
	await expect(page.getByText('Nieuwe tekst')).toBeVisible();
	await page.getByLabel('Te vervangen tekst').fill(telephoneNumber);
	await page.getByRole('button', { name: 'Preview' }).click();

	await expect(page.getByText(redactedBody)).toBeVisible();
	await expect(page.getByText(answerBody)).toBeVisible();
	await page.getByRole('button', { name: 'Opslaan' }).click();

	await expect(page.getByText('Het antwoord is geredigeerd.')).toBeVisible();
	await expect(page.getByText('Originele tekst')).not.toBeVisible();
	await expect(page.getByText('Nieuwe tekst')).not.toBeVisible();
	await expect(page.getByText(redactedBody)).toBeVisible();
	await expect(page.getByText(answerBody)).not.toBeVisible();
	await expect(page.getByText(`"${telephoneNumber}" → "${replaceText}"`)).toBeVisible();

	const moderationAction = await getLastModerationActionForAnswer(answer.id);
	expect(moderationAction.action).toBe('answer-redacted');
	expect(moderationAction.meta).toMatchObject({
		searchTexts: [telephoneNumber],
		replaceTexts: [replaceText],
		original: answerBody,
		redacted: redactedBody
	})
});

test('a moderator can make a single redaction from the slug page', async ({ context, page }) => {
	const question = await createQuestion(testAsker, testPoliticianUser);
	const telephoneNumber = '06 12345678';
	const replaceText = '<verwijderd>';
	const answerBody = `This answer contains the private telephone number ${telephoneNumber} to be redacted.`;
	const redactedBody = `This answer contains the private telephone number ${replaceText} to be redacted.`;
	const answer = await createAnswer(question, { body: answerBody });

	await signInAs(context, testModerator.id);
	const returnTo = encodeURIComponent(`http://127.0.0.1:4173/modereren/inbox`);
	await page.goto(`/modereren/antwoorden/${answer.id}?returnTo=${returnTo}`);

	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answerBody)).toBeVisible();
	await expect(page.getByText(redactedBody)).not.toBeVisible();
	await page.getByRole('button', { name: 'Redigeren' }).click();

	await expect(page.getByText('Originele tekst')).toBeVisible();
	await expect(page.getByText('Nieuwe tekst')).toBeVisible();
	await page.getByLabel('Te vervangen tekst').fill(telephoneNumber);
	await page.getByRole('button', { name: 'Preview' }).click();

	await expect(page.getByText(redactedBody)).toBeVisible();
	await expect(page.getByText(answerBody)).toBeVisible();
	await page.getByRole('button', { name: 'Opslaan' }).click();

	await expect(page.getByText('Het antwoord is geredigeerd.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(redactedBody)).not.toBeVisible();
	await expect(page.getByText(answerBody)).not.toBeVisible();

	const moderationAction = await getLastModerationActionForAnswer(answer.id);
	expect(moderationAction.action).toBe('answer-redacted');
	expect(moderationAction.meta).toMatchObject({
		searchTexts: [telephoneNumber],
		replaceTexts: [replaceText],
		original: answerBody,
		redacted: redactedBody
	})
});

test('a moderator can make multiple redactions in the list', async ({ context, page }) => {
	const question = await createQuestion(testAsker, testPoliticianUser);
	const telephoneNumber = '06 12345678';
	const replaceText1 = '<verwijderd>';
	const address = 'Dorpsstraat 1';
	const replaceText2 = '<verborgen>';
	const answerBody = `This answer contains the private telephone number ${telephoneNumber} and the ${address} to be redacted.`;
	const redactedBody1 = `This answer contains the private telephone number ${replaceText1} and the ${address} to be redacted.`;
	const redactedBody = `This answer contains the private telephone number ${replaceText1} and the ${replaceText2} to be redacted.`;
	const answer = await createAnswer(question, { body: answerBody });

	await signInAs(context, testModerator.id);
	await page.goto('/modereren/antwoorden');

	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(answerBody)).toBeVisible();
	await expect(page.getByText(redactedBody)).not.toBeVisible();
	await page.getByRole('button', { name: 'Redigeren' }).click();

	await expect(page.getByText('Originele tekst')).toBeVisible();
	await expect(page.getByText('Nieuwe tekst')).toBeVisible();
	await page.getByLabel('Te vervangen tekst').fill(telephoneNumber);
	await page.getByTitle('Regel toevoegen').click();

	await expect(page.getByText(redactedBody1)).toBeVisible();
	await expect(page.getByText(answerBody)).toBeVisible();
	await page.getByLabel('Te vervangen tekst').last().fill(address);
	await page.getByLabel('Vervangen door').last().fill(replaceText2);
	await page.getByRole('button', { name: 'Preview' }).click();

	await expect(page.getByText(redactedBody)).toBeVisible();
	await expect(page.getByText(answerBody)).toBeVisible();
	await page.getByRole('button', { name: 'Opslaan' }).click();

	await expect(page.getByText('Het antwoord is geredigeerd.')).toBeVisible();
	await expect(page.getByText('Originele tekst')).not.toBeVisible();
	await expect(page.getByText('Nieuwe tekst')).not.toBeVisible();
	await expect(page.getByText(redactedBody)).toBeVisible();
	await expect(page.getByText(answerBody)).not.toBeVisible();
	await expect(page.getByText(`"${telephoneNumber}" → "${replaceText1}"`)).toBeVisible();
	await expect(page.getByText(`"${address}" → "${replaceText2}"`)).toBeVisible();

	const moderationAction = await getLastModerationActionForAnswer(answer.id);
	expect(moderationAction.action).toBe('answer-redacted');
	expect(moderationAction.meta).toMatchObject({
		searchTexts: [telephoneNumber, address],
		replaceTexts: [replaceText1, replaceText2],
		original: answerBody,
		redacted: redactedBody
	})
});
