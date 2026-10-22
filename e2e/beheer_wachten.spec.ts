import { expect, signInAs, test } from './fixtures';
import { testAdmin, testAsker, testPoliticianUser } from './data';
import { createQuestion, testBeforeEach, makeEmail, createInboxRow } from './test-utils';
import { SEND_REMINDER_AFTER_DAYS, DAY_MS } from '$lib/general';

test.beforeEach(async ({ page }) => {
	await testBeforeEach(page);
});

test('a waiting question should mention an inbox entry with status Andere Afzender', async ({
  context,
  page
}) => {
  const dateAsked = new Date(Date.now() - (SEND_REMINDER_AFTER_DAYS + 1) * DAY_MS);
  const question = await createQuestion(testAsker, testPoliticianUser, {
    status: 'approved',
    createdAt: dateAsked,
    referenceDate: dateAsked
  });
  const email = makeEmail(testPoliticianUser.email, question.emailToken);
  await createInboxRow(email, 'ignored_different_sender');

  await signInAs(context, testAdmin.id);
  await page.goto('/beheer/niet-beantwoord/wachten');

  await expect(page.getByRole('heading', { name: 'Niet-beantwoorde vragen' })).toBeVisible();
  await expect(page.getByText(question.title)).toBeVisible();
  await page.getByRole('button', { name: 'Toon details' }).click();

  await expect(page.getByText(question.body)).toBeVisible();
  await expect(page.getByText("Nog in Inbox")).toBeVisible();
  await expect(page.getByText("ignored_different_sender")).toBeVisible();
  await expect(page.getByText(testPoliticianUser.email)).toBeVisible();
});
