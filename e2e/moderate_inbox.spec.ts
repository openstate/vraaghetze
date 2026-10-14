import { randomUUID } from 'crypto';
import { testAsker, testModerator, testPoliticianUser } from './data';
import { expect, signInAs, test } from './fixtures';
import { createInboxRow, createQuestion, makeEmail, testBeforeEach } from './test-utils';
import { extractAddress } from '$lib/server/email/parse-inbound';

test.beforeEach(async ({ page }) => {
  await testBeforeEach(page);
});

test('processes the mail and creates an answer', async ({ context, page }) => {
  const question = await createQuestion(testAsker, testPoliticianUser, { status: 'approved', emailToken: randomUUID() });
  const email = makeEmail(testPoliticianUser.email, question.emailToken);
  const row = await createInboxRow(email, 'ignored_different_sender');
  expect(row.status).toBe('ignored_different_sender');

  await signInAs(context, testModerator.id);
  await page.goto('/modereren/inbox');

  await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText('Andere Afzender', { exact: true })).toBeVisible();
  await expect(page.getByText(question.body)).not.toBeVisible();
  await page.getByRole('button', { name: 'Toon details' }).click();

  await expect(page.getByRole('heading', { name: 'Genegeerde e-mail' })).toBeVisible();
  await expect(page.getByText(email.text!)).toBeVisible();
  await page.getByRole('button', { name: 'Toch verwerken' }).click();

  await expect(page).toHaveURL(/^http:\/\/127.0.0.1:4173\/modereren\/antwoorden\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\?/);
  await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText('Sommige onderstaande acties worden direct doorgevoerd zonder verdere bevestiging')).toBeVisible();

  await page.getByRole('button', { name: 'Keur goed' }).click();
  await expect(page).toHaveURL(/^http:\/\/127.0.0.1:4173\/modereren\/inbox$/);
  await expect(page.getByText('Je hebt het antwoord goedgekeurd')).toBeVisible();
  await expect(page.getByText('Verwerkt', { exact: true })).toBeVisible();
});

test('ignores the mail', async ({ context, page }) => {
  const question = await createQuestion(testAsker, testPoliticianUser, { status: 'approved', emailToken: randomUUID() });
  const email = makeEmail(testPoliticianUser.email, question.emailToken);
  const row = await createInboxRow(email, 'ignored_different_sender');
  expect(row.status).toBe('ignored_different_sender');

  await signInAs(context, testModerator.id);
  await page.goto('/modereren/inbox');

  await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText('Andere Afzender', { exact: true })).toBeVisible();
  await expect(page.getByText(question.body)).not.toBeVisible();
  await page.getByRole('button', { name: 'Toon details' }).click();

  await expect(page.getByRole('heading', { name: 'Genegeerde e-mail' })).toBeVisible();
  await expect(page.getByText(email.text!)).toBeVisible();
  await page.getByRole('button', { name: 'Negeren' }).click();

  await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(`De mail van verkeerde afzender ${extractAddress(email.from)} wordt definitief genegeerd.`)).toBeVisible();
	await expect(page.getByText('Genegeerd', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/^http:\/\/127.0.0.1:4173\/modereren\/inbox$/);
});
