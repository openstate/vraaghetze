import { expect, test } from './fixtures';
import { testAsker, testPoliticianUser } from './data';
import { createQuestion, testBeforeEach } from './test-utils';
import { DAY_MS, SEND_REMINDER_AFTER_DAYS } from '$lib/general';

test.beforeEach(async ({ page }) => {
  await testBeforeEach(page);
});

test('indicates that a reminder has been sent', async ({ page }) => {
  const dateAsked = new Date(Date.now() - (SEND_REMINDER_AFTER_DAYS + 1) * DAY_MS);
  const question = await createQuestion(testAsker, testPoliticianUser, {
    status: 'approved',
    createdAt: dateAsked,
    referenceDate: dateAsked,
    remindedAt: new Date()
  });

	await page.goto('/vragen');
	await expect(page.getByRole('heading', { name: 'Vragen & Antwoorden' })).toBeVisible();
	await expect(page.getByText(question.title)).toBeVisible();
	await expect(page.getByText('Wacht op antwoord van')).toBeVisible();
	await expect(page.getByText('Herinnering gestuurd op')).toBeVisible();
});
