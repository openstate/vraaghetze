import { expect, signInAs, test } from './fixtures';
import { testAsker, testModerator, testPolitician, testPoliticianUser } from './data';
import { createQuestion, getEnqueuedMail, testBeforeEach } from './test-utils';

test.beforeEach(async ({ page }) => {
	await testBeforeEach(page);
});

test('a moderator can propose a different politician', async ({ context, page }) => {
	const title = 'Wat doet u tegen de wooncrisis?';
	const body = 'In mijn gemeente staan mensen jaren op de wachtlijst voor een sociale huurwoning.';
	const question = await createQuestion(testAsker, testPoliticianUser, { title, body });

	await signInAs(context, testModerator.id);

	await page.goto('/modereren/vragen');
	await expect(page.getByRole('heading', { name: 'Moderatie' })).toBeVisible();
	await expect(page.getByText(title)).toBeVisible();
	await expect(page.getByText(body)).toBeVisible();
	await page.getByRole('button', { name: 'Kamerlid aanpassen' }).click();

	await expect(page.getByText('Selecteer ander Kamerlid')).toBeVisible();
	await page.getByLabel('Naam').fill(testPoliticianUser.name);
	await page.getByRole('link', { name: testPoliticianUser.name }).last().click();

	await expect(
		page.getByText(`Bevestig het aanpassen van het Kamerlid naar ${testPolitician.slug}`)
	).toBeVisible();
	await page.getByRole('button', { name: 'Kamerlid aanpassen' }).last().click();

	await expect(page.getByText('pending-wrong-politician')).toBeVisible();
	await expect(page.getByText(`naar ${testPolitician.slug}`)).toBeVisible();
	const sentEmail = await getEnqueuedMail(testAsker.email);
	expect(sentEmail.subject).toEqual('Voorgestelde wijziging Kamerlid voor jouw vraag');
	expect(sentEmail.to).toEqual(testAsker.email);
	expect(sentEmail.body).toContain(
		`http://127.0.0.1:4173/vragen/${question.slug}?doel=kamerlid_wijzigen`
	);
});
