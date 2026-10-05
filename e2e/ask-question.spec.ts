import { expect, schema, signInAs, test } from './fixtures';
import { testAsker, testPolitician } from './data';
import { randomBytes } from 'node:crypto';
import { db } from '$lib/server/db';
import { readFileSync } from 'fs';
import { eq } from 'drizzle-orm';

test.beforeEach(async ({ db, page }) => {
	await db.delete(schema.question);
	await db.delete(schema.session);
	await page.setViewportSize({ width: 1280, height: 1200 });
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

test('a new user can submit a question by registering', async ({ context, page }) => {
	const title = 'Wat doet u tegen de wooncrisis?';
	const body = 'In mijn gemeente staan mensen jaren op de wachtlijst voor een sociale huurwoning.';
	const name = 'Joris de Vries'
	const email = `${randomBytes(16).toString('hex')}@example.com`

	await page.goto('/vragen/stellen');
	await expect(page.getByRole('heading', { name: 'Kies een Kamerlid' })).toBeVisible();

	await page.getByLabel('Naam').fill(testPolitician.name);
	await page.getByRole('link', { name: testPolitician.name }).click();

	await expect(page.getByRole('heading', { name: 'Schrijf je vraag' })).toBeVisible();
	await page.getByLabel('Je vraag').fill(title);
	await page.getByLabel('Voeg context toe').fill(body);
	await page.getByRole('button', { name: 'Volgende' }).click();

	await expect(page.getByRole('heading', { name: 'Vul je gegevens in' })).toBeVisible();
	await page.getByLabel('Je volledige naam').fill(name);
	await page.getByLabel('Je e-mailadres').fill(email);
	await page.getByLabel('Bevestiging e-mailadres').fill(email);
	await page.locator("[name='acceptTandC']").check();
	await page.locator("[name='ageChecked']").check();
	await page.getByRole('button', { name: 'Volgende' }).click();

	await expect(page.getByRole('heading', { name: 'Verstuur je vraag' })).toBeVisible();
	await expect(page.getByText(title)).toBeVisible();
	await expect(page.getByText(body)).toBeVisible();
	await expect(page.getByText(`${name} · ${email}`)).toBeVisible();
	await page.getByRole('button', { name: 'Verstuur vraag' }).click();

	await expect(page.getByText('Captcha validatie is mislukt.')).toBeVisible();
	await page.getByText('Ik ben geen robot').last().click()
	await expect(page.getByText('Voltooid')).toBeVisible();
	await page.getByRole('button', { name: 'Verstuur vraag' }).click();

	await expect(page).toHaveURL('/vragen/stellen/controle');
	await expect(page.getByRole('heading', { name: 'Bijna klaar!' })).toBeVisible();
	await expect(page.getByText(`We hebben een link naar ${email} gestuurd. Klik erop om je vraag te bevestigen en te bekijken.`)).toBeVisible();
	await (expect(page.getByTitle('Mijn profiel'))).not.toBeVisible();
	const sentEmail = await getMail(email);
	expect(sentEmail.subject).toEqual('Bevestig je vraag op VraagHetZe');
	expect(sentEmail.to).toEqual(email);

	await page.goto(sentEmail.magicLinkUrl);
	await expect(page).toHaveURL('/vragen/wat-doet-u-tegen-de-wooncrisis?doel=bevestigen');
	await expect(page.getByRole('heading', { name: 'Vraag & Antwoord' })).toBeVisible();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await expect(page.getByText(body)).toBeVisible();
	await expect(page.getByText(`Vraag van ${name} op`)).toBeVisible();
	await (expect(page.getByTitle('Mijn profiel'))).toBeVisible();
	await expect(page.getByText('Heb jij deze vraag gesteld?')).toBeVisible();
	await page.getByRole('button', { name: 'Ja, dit was ik' }).click();

	await expect(page).toHaveURL('/vragen/wat-doet-u-tegen-de-wooncrisis?doel=bevestigen');
	await expect(page.getByRole('heading', { name: 'Vraag & Antwoord' })).toBeVisible();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();
	await expect(page.getByText(body)).toBeVisible();
	await expect(page.getByText(`Vraag van ${name} op`)).toBeVisible();
	await expect(page.getByText('wacht op moderatie')).toBeVisible();
	await (expect(page.getByTitle('Mijn profiel'))).toBeVisible();
	await expect(page.getByText('Je vraag is bevestigd en wacht nu op moderatie.')).toBeVisible();
});

test('a new user can submit a question by logging in', async ({ context, page }) => {
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

	await expect(page.getByRole('heading', { name: 'Vul je gegevens in' })).toBeVisible();
	await page.getByText("Inloggen").click();

	await page.getByLabel('Je e-mailadres').fill(testAsker.email);
	await page.getByRole('button', { name: 'Volgende' }).click();

	await expect(page.getByText('Als je bij ons een account hebt is er een code naar je e-mailadres gestuurd.')).toBeVisible();
	const sentEmail = await getMail(testAsker.email);
	expect(sentEmail.subject).toEqual('Je inlogcode voor VraagHetZe');
	expect(sentEmail.to).toEqual(testAsker.email);
	await page.getByLabel('Code uit e-mail').fill(sentEmail.code);
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

async function getMagicLinkIdentifier(email: string) {
	const [row] = await db
		.select({ id: schema.verification.identifier })
		.from(schema.verification)
		.where(eq(schema.verification.value, `{"email":"${email}"}`))
		.limit(1);

	return row.id;
}

async function getMail(email: string) {
	const magicLinkIdentifier = await getMagicLinkIdentifier(email);
	let contents = JSON.parse((readFileSync(`./test-results/mails/${magicLinkIdentifier}.json`)).toString());

	let match = /\s(http:\/\/127.0.0.1:4173\/api\/auth\/magic-link[^\s]+)\.\s/.exec(contents.body);
	if (match) {
		contents = { ...contents, magicLinkUrl: match[1] };
	}

	match = /\sHierbij de code om in te loggen:\s+([^\s]+)\s/.exec(contents.body);
	if (match) {
		contents = { ...contents, code: match[1]};
	}

	return contents;
}
