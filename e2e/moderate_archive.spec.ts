import { expect, signInAs, test } from './fixtures';
import { testAsker, testModerator, testOtherPolitician, testOtherPoliticianUser, testPoliticianUser } from './data';
import { createQuestion, testBeforeEach } from './test-utils';

test.beforeEach(async ({ page }) => {
  await testBeforeEach(page);
});

test('a moderator can propose a different politician after approval and not resend the question by email', async ({ context, page }) => {
  const title = 'Wat doet u tegen de wooncrisis?';
  const body = 'In mijn gemeente staan mensen jaren op de wachtlijst voor een sociale huurwoning.';
  await createQuestion(testAsker, testPoliticianUser, { title, body, status: 'approved' });

  await signInAs(context, testModerator.id);

  await page.goto('/modereren/archief');
  await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
  await expect(page.getByText(title)).toBeVisible();
	await expect(page.getByText(body)).not.toBeVisible();
  await page.getByRole('button', { name: 'Toon details' }).click();

  await expect(page.getByText(body)).toBeVisible();
  await page.getByRole('button', { name: 'Kamerlid aanpassen' }).click();

  await expect(page.getByText('Selecteer ander Kamerlid')).toBeVisible();
  await page.getByLabel('Naam').fill(testOtherPoliticianUser.name);
  await page.getByRole('link', { name: testOtherPoliticianUser.name }).last().click();

  await expect(
    page.getByText(`Bevestig het aanpassen van het Kamerlid naar ${testOtherPolitician.slug}`)
  ).toBeVisible();
  await page.getByRole('button', { name: 'Kamerlid aanpassen' }).last().click();

  await expect(page.getByText(`Kamerlid is aangepast naar ${testOtherPolitician.slug}.`)).toBeVisible();
  await expect(page.getByText('en de vraag is gemaild naar het nieuwe Kamerlid')).not.toBeVisible();  
});

test('a moderator can propose a different politician after approval and resend the question by email', async ({ context, page }) => {
  const title = 'Wat doet u tegen de wooncrisis?';
  const body = 'In mijn gemeente staan mensen jaren op de wachtlijst voor een sociale huurwoning.';
  await createQuestion(testAsker, testPoliticianUser, { title, body, status: 'approved' });

  await signInAs(context, testModerator.id);

  await page.goto('/modereren/archief');
  await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
  await expect(page.getByText(title)).toBeVisible();
  await page.getByRole('button', { name: 'Toon details' }).click();

  await expect(page.getByText(body)).toBeVisible();
  await page.getByRole('button', { name: 'Kamerlid aanpassen' }).click();

  await expect(page.getByText('Selecteer ander Kamerlid')).toBeVisible();
  await page.getByLabel('Naam').fill(testOtherPoliticianUser.name);
  await page.getByRole('link', { name: testOtherPoliticianUser.name }).last().click();

  await expect(
    page.getByText(`Bevestig het aanpassen van het Kamerlid naar ${testOtherPolitician.slug}`)
  ).toBeVisible();
  await page.getByLabel('Stuur e-mail').check();  
  await page.getByRole('button', { name: 'Kamerlid aanpassen' }).last().click();

  await expect(page.getByText(`Kamerlid is aangepast naar ${testOtherPolitician.slug} en de vraag is gemaild naar het nieuwe Kamerlid.`)).toBeVisible();
});
