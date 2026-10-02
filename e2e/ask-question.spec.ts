import { expect, schema, signInAs, test } from './fixtures';
import { testAsker, testPolitician } from './data';

test.beforeEach(async ({ db }) => {
	await db.delete(schema.question);
	await db.delete(schema.session);
});

test('a signed-in user can submit a question for moderation', async ({ context, page }) => {
	await signInAs(context, testAsker.id);

	const title = 'Wat doet u tegen de wooncrisis?';
	const body = 'In mijn gemeente staan mensen jaren op de wachtlijst voor een sociale huurwoning.';

	await page.goto('/vragen/stellen');
	await expect(page.getByRole('heading', { name: 'Kies een Kamerlid' })).toBeVisible();

	await page.getByLabel('Naam').fill(testPolitician.name);
	await page.getByRole('link', { name: testPolitician.name }).click();

	await expect(page.getByRole('heading', { name: 'Schrijf je vraag' })).toBeVisible();
	await page.getByLabel('Je vraag').fill(title);
	await page.getByLabel('Voeg context toe').fill(body);
	await page.getByRole('button', { name: 'Volgende' }).click();

	await expect(page.getByRole('heading', { name: 'Verstuur je vraag' })).toBeVisible();
	await expect(page.getByText(title)).toBeVisible();
	await expect(page.getByText(body)).toBeVisible();
	await expect(page.getByText(`${testAsker.name} · ${testAsker.email}`)).toBeVisible();
	await page.getByRole('button', { name: 'Verstuur vraag' }).click();

	await expect(page).toHaveURL('/vragen/wat-doet-u-tegen-de-wooncrisis');
	await expect(page.getByRole('heading', { name: 'Vraag & Antwoord' })).toBeVisible();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await expect(page.getByText(body)).toBeVisible();
	await expect(page.getByText(`Vraag van ${testAsker.name} op`)).toBeVisible();
	await expect(page.getByText('wacht op moderatie')).toBeVisible();
});
