import { execSync } from 'child_process';
import { testAsker, testPoliticianUser } from './data';
import { expect, test } from './fixtures';
import { createEncodedTextFile, createQuestion, createSendgridCurlScript, getInboxEmail, testBeforeEach } from './test-utils';
import { randomBytes, randomUUID } from 'crypto';

// Emails received via SendGrid (json structures) are parsed assuming UTF-8, but may contain 1 or more
// fields in a different encoding, denoted by the `charsets` key. Here we simulate API calls by SendGrid
// using different encodings.
test.beforeEach(async ({ page }) => {
  await testBeforeEach(page);
});

test('receiving an email with all UTF-8 encoding', async ({ context, page }) => {
  const question = await createQuestion(testAsker, testPoliticianUser, { status: 'approved', emailToken: randomUUID() });

  const utf8Text = 'A normal UTF-8 encoded text';
  const fromEmail = `${randomBytes(16).toString('hex')}@openstate.eu`;
  const scriptName = createSendgridCurlScript({
    filename: 'all_utf8',
    fromEmail: fromEmail,
    emailToken: question.emailToken ?? '',
    subject: `Re: ${question.title}`,
    text: utf8Text
  });

  execSync(scriptName);
  
  const mail = await getInboxEmail(fromEmail);
  expect(mail.payload.text).toBe(utf8Text)
});

test('receiving an email with 1 field in windows-1252 encoding', async ({ context, page }) => {
  const question = await createQuestion(testAsker, testPoliticianUser, { status: 'approved', emailToken: randomUUID() });

  const filename = 'one_windows_1252';
	const windows1252Text = "Dit is zo\xB4n antwoord met h\xE9\xE9l vreemde tekens";
	const utf8Text = "Dit is zo´n antwoord met héél vreemde tekens";

  const textFilename = createEncodedTextFile({
    text: windows1252Text,
    encoding: 'latin1',
    filename: filename
  })

  const fromEmail = `${randomBytes(16).toString('hex')}@openstate.eu`;

  const scriptName = createSendgridCurlScript({
    filename: filename,
    fromEmail: fromEmail,
    emailToken: question.emailToken ?? '',
    subject: `Re: ${question.title}`,
    textFilename: textFilename,
    charsets: { text: 'windows-1252' }
  });

  execSync(scriptName);
  
  const mail = await getInboxEmail(fromEmail);
  expect(mail.payload.text).toBe(utf8Text)
});

test('receiving an email with 2 fields in windows-1252 encoding', async ({ context, page }) => {
  const question = await createQuestion(testAsker, testPoliticianUser, { status: 'approved', emailToken: randomUUID() });

  const filenameText = 'text_windows_1252';
	const windows1252Text = "Dit is zo\xB4n antwoord met h\xE9\xE9l vreemde tekens";
	const utf8Text = "Dit is zo´n antwoord met héél vreemde tekens";
  const filenameSubject = 'subject_windows_1252';
	const windows1252Subect = "Dit is zo\xB4n onderwerp met h\xE9\xE9l vreemde tekens";
	const utf8Subject = "Dit is zo´n onderwerp met héél vreemde tekens";

  const textFilename = createEncodedTextFile({
    text: windows1252Text,
    encoding: 'latin1',
    filename: filenameText
  })

  const subjectFilename = createEncodedTextFile({
    text: windows1252Subect,
    encoding: 'latin1',
    filename: filenameSubject
  })

  const fromEmail = `${randomBytes(16).toString('hex')}@openstate.eu`;

  const scriptName = createSendgridCurlScript({
    filename: 'text_and_subject_windows_1252',
    fromEmail: fromEmail,
    emailToken: question.emailToken ?? '',
    subjectFilename: subjectFilename,
    textFilename: textFilename,
    charsets: { text: 'windows-1252', subject: 'windows-1252' }
  });

  execSync(scriptName);
  
  const mail = await getInboxEmail(fromEmail);
  expect(mail.payload.text).toBe(utf8Text)
  expect(mail.payload.subject).toBe(utf8Subject)
  expect(mail.subject).toBe(utf8Subject)
});
