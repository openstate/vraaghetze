// LLM-generated seed script for development only
// By default it applies directly to the database, use `--sql [path]` to write the statements to a file instead

import { countDistinct, eq, getTableName, sql, type Table } from 'drizzle-orm';
import { randomBytes, randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { client, db, schema } from '$lib/server/db';
import { dedupKey } from '$lib/server/email/parse-inbound';
import { slugify, slugifyUnique } from '$lib/server/utils/slug';
import type { InboxStatus, ModerationStatus } from './app.schema';
import {
	answerVoices,
	approvalNotes,
	closingLines,
	edgeCases,
	firstNames,
	lastNames,
	listAnswer,
	rejectionNotes,
	topics,
	type SeedQuestion
} from './seed-corpus';
import { allRejectionReasons } from '$lib/moderation';

const ADMINS = [{ name: 'Open State Developers', email: 'developers@openstate.eu' }];

const QUESTION_COUNT = 250;
const SPAN_DAYS = 122;

const ASKER_BUCKETS = [
	// [number of askers, questions each], adding up to QUESTION_COUNT
	[100, 1],
	[30, 2],
	[12, 3],
	[5, 4],
	[3, 6],
	[2, 8]
] as const;

const RECIPIENT_SHARE = 0.7; // share of politicians that gets a question at all
const UNVERIFIED_SHARE = 0.1; // asks that never confirm the magic link
const RETURNING_SIGNED_IN = 0.6; // a returning asker is usually already signed in
const SESSION_DAYS = 7; // better-auth session lifetime
const MODERATION_WINDOW_DAYS = 11; // how long a question can sit in the queue
const APPROVAL_SHARE = 0.75 / 0.9; // of the moderated ones
const ANSWERS_IN_QUEUE = 3;

// chance an approved question gets an answer, by days since approval
const ANSWER_BY_AGE = [
	[90, 0.7],
	[60, 0.6],
	[30, 0.45],
	[14, 0.25],
	[7, 0.15],
	[0, 0.07]
] as const;

const sqlFlag = process.argv.indexOf('--sql');
const sqlArgument = process.argv[sqlFlag + 1];
const sqlFile =
	sqlFlag === -1 ? null : sqlArgument && !sqlArgument.startsWith('-') ? sqlArgument : 'seed.sql';

const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'vraaghetze.nu';
const DIVERSION_EMAIL = process.env.DIVERSION_EMAIL || '';

const NOW = new Date();
const DAY = 24 * 60 * 60 * 1000;
const START = new Date(NOW.getTime() - SPAN_DAYS * DAY);

const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

const between = (min: number, max: number) => min + Math.random() * (max - min);

const chance = (probability: number) => Math.random() < probability;

const linkToken = () => randomBytes(16).toString('hex');

function shuffle<T>(items: T[]) {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index--) {
		const swap = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
	}
	return shuffled;
}

function weightedIndex(weights: number[]) {
	const total = weights.reduce((sum, weight) => sum + weight, 0);
	let threshold = Math.random() * total;
	for (let index = 0; index < weights.length; index++) {
		threshold -= weights[index];
		if (threshold <= 0) return index;
	}
	return weights.length - 1;
}

const timestampInSpan = (fromDay = 0, untilDay = SPAN_DAYS) =>
	new Date(START.getTime() + between(fromDay, untilDay) * DAY);

// most delays are short and a few drag on: cubing the draw keeps the tail thin
const addDelay = (date: Date, minHours: number, maxHours: number) =>
	new Date(date.getTime() + (minHours + (maxHours - minHours) * Math.random() ** 3) * 3600 * 1000);

const daysSince = (date: Date) => (NOW.getTime() - date.getTime()) / DAY;

const politicians = await db
	.select({
		id: schema.politician.id,
		userId: schema.politician.userId,
		fractionId: schema.politician.fractionId,
		fractionRole: schema.politician.fractionRole,
		name: schema.user.name,
		email: schema.user.email
	})
	.from(schema.politician)
	.innerJoin(schema.user, eq(schema.user.id, schema.politician.userId))
	.where(eq(schema.politician.isActive, true))
	.orderBy(schema.politician.slug);

if (politicians.length === 0) throw new Error('no active politicians, run the sync first');

// order follows the foreign keys: moderation_action and inbox point at answers,
// answers and outbox point at questions
const WIPE = [
	'delete from moderation_action',
	'delete from inbox',
	'delete from outbox',
	'delete from answer',
	'delete from question',
	// the admins included, they are recreated below. sessions and accounts cascade
	'delete from "user" where id not in (select user_id from politician)'
];

// dated before the span, so an account is never younger than its own moderation actions
const admins = ADMINS.map((admin) => ({
	id: randomUUID(),
	name: admin.name,
	email: admin.email,
	emailVerified: true,
	createdAt: new Date(START.getTime() - DAY),
	updatedAt: new Date(START.getTime() - DAY),
	role: 'admin'
}));

type Asker = { id: string; name: string; email: string; questions: number };

const usedEmails = new Set<string>();

function askerEmail(name: string) {
	const base = slugify(name).replace(/-/g, '.');
	let email = `${base}@voorbeeld.nl`;
	let suffix = 1;
	while (usedEmails.has(email)) email = `${base}${++suffix}@voorbeeld.nl`;
	usedEmails.add(email);
	return email;
}

const askers: Asker[] = [];
for (const [count, questionsEach] of ASKER_BUCKETS) {
	for (let index = 0; index < count; index++) {
		const name = `${pick(firstNames)} ${pick(lastNames)}`;
		askers.push({ id: randomUUID(), name, email: askerEmail(name), questions: questionsEach });
	}
}

// one ticket per question, shuffled so heavy askers are spread over the whole period
const askerTickets = shuffle(askers.flatMap((asker) => Array(asker.questions).fill(asker)));

const chairs = politicians.filter((politician) => politician.fractionRole === 'chair');
const members = shuffle(politicians.filter((politician) => politician.fractionRole !== 'chair'));

const recipients = [...chairs, ...members].slice(
	0,
	Math.round(politicians.length * RECIPIENT_SHARE)
);

// zipf over the recipients: everyone in the pool gets one question, the rest pile up at
// the front, where the fraction chairs are
const zipf = recipients.map((_, rank) => 1 / (rank + 2));

const assignments = [...recipients];
while (assignments.length < QUESTION_COUNT) assignments.push(recipients[weightedIndex(zipf)]);

const politicianTickets = shuffle(assignments.slice(0, QUESTION_COUNT));

type Draft = SeedQuestion & {
	answer: string;
	createdAt: Date;
	alwaysAnswered?: boolean;
	listAnswer?: boolean;
};

const corpusPool = shuffle(
	topics.flatMap((topic) =>
		topic.questions.map((question) => ({ ...question, answer: pick(topic.answers) }))
	)
);

const wanted = QUESTION_COUNT - edgeCases.length;
if (corpusPool.length < wanted) throw new Error('corpus too small');

const drafts: Draft[] = corpusPool
	.slice(0, wanted)
	.map((question) => ({ ...question, createdAt: timestampInSpan() }));

for (const edgeCase of edgeCases) {
	drafts.push({
		...edgeCase,
		// one that has to end up answered is dated early enough in the span that moderation
		// and a reply still fit before today
		createdAt: edgeCase.alwaysAnswered ? timestampInSpan(10, SPAN_DAYS - 40) : timestampInSpan()
	});
}

drafts.sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());

type QuestionRow = typeof schema.question.$inferInsert;
type OutboxRow = typeof schema.outbox.$inferInsert;

const questionRows: QuestionRow[] = [];
const answerRows: (typeof schema.answer.$inferInsert)[] = [];
const moderationRows: (typeof schema.moderationAction.$inferInsert)[] = [];
const outboxRows: OutboxRow[] = [];
const inboxRows: (typeof schema.inbox.$inferInsert)[] = [];

const askerFirstAsk = new Map<string, Date>();
const askerLastAsk = new Map<string, Date>();
const askersConfirmed = new Set<string>();

// the politician an approved question went out to, so the stray mail below can send from
// the address the real pipeline would demand
const politicianByQuestion = new Map<string, (typeof politicians)[number]>();

const resolveMailAddress = (address: string) => DIVERSION_EMAIL || address;

// every row is spelled out in the same order, because insertInto writes them positionally
function enqueue(
	mail: Pick<OutboxRow, 'kind' | 'recipient' | 'subject' | 'body' | 'createdAt'> &
		Partial<Pick<OutboxRow, 'questionId' | 'replyTo' | 'expiresAt'>>
) {
	const createdAt = mail.createdAt!;

	const row: OutboxRow = {
		id: randomUUID(),
		kind: mail.kind,
		questionId: mail.questionId ?? null,
		recipient: mail.recipient,
		replyTo: mail.replyTo ?? null,
		subject: mail.subject,
		body: mail.body,
		status: 'sent',
		attempts: 1,
		lastError: null,
		expiresAt: mail.expiresAt ?? null,
		nextAttemptAt: createdAt,
		sentAt: addDelay(createdAt, 0.001, 0.02),
		createdAt
	};

	if (chance(0.015)) {
		row.status = 'failed';
		row.sentAt = null;

		// a mail with an expiry can also be failed at claim time for being expired, and that
		// path never increments the attempt counter
		if (row.expiresAt && chance(0.5)) {
			row.attempts = 0;
			row.lastError = 'verlopen';
		} else {
			row.attempts = 8;
			row.lastError = pick([
				'Failed to send email: 550 The from address does not match a verified Sender Identity',
				'Failed to send email: 429 Too many requests',
				'Failed to send email: 401 Unauthorized'
			]);
		}
	}

	outboxRows.push(row);
}

// dkim as SendGrid reports it; isSenderVerified only accepts a signature by the from domain
const passingDkim = (from: string) => `{@${from.split('@')[1]} : pass}`;

function inboundPayload(
	from: string,
	to: string,
	subject: string,
	text: string,
	dkim: string,
	extraHeaders: string[] = []
) {
	return {
		headers: [
			`Return-Path: <${from}>`,
			`From: ${from}`,
			`To: ${to}`,
			`Subject: ${subject}`,
			...extraHeaders,
			'MIME-Version: 1.0'
		].join('\n'),
		dkim,
		SPF: 'pass',
		to,
		from,
		subject,
		text,
		sender_ip: '192.0.2.44',
		envelope: { from, to: [to] },
		charsets: { to: 'UTF-8', from: 'UTF-8', subject: 'UTF-8', text: 'UTF-8' }
	};
}

const magicLink = (callback: string) =>
	`${ORIGIN}/api/auth/magic-link/verify?token=${linkToken()}&callbackURL=${encodeURIComponent(callback)}`;

const MAGIC_LINK_EXPIRY = 30 * 60 * 1000; // MAGIC_LINK_EXPIRY_SECONDS in auth.ts

const slugsTaken = new Set<string>(['stellen']);

for (const [index, draft] of drafts.entries()) {
	const asker = askerTickets[index];
	const politician = politicianTickets[index];
	const createdAt = draft.createdAt;

	// the drafts run oldest first, so the first sighting of an asker is their first ask
	const previousAsk = askerLastAsk.get(asker.id);
	if (!previousAsk) askerFirstAsk.set(asker.id, createdAt);
	askerLastAsk.set(asker.id, createdAt);

	const signedIn = !!previousAsk && chance(RETURNING_SIGNED_IN);

	const verifiedAt = signedIn
		? createdAt
		: chance(UNVERIFIED_SHARE) && !draft.alwaysAnswered
			? null
			: addDelay(createdAt, 0.05, 12);

	if (verifiedAt) askersConfirmed.add(asker.id);

	const slug = slugifyUnique(slugify(draft.title) || 'vraag', slugsTaken);
	const questionId = randomUUID();

	// only a confirmed question reaches the queue, and the chance it is still waiting
	// drops off over the moderation window
	const age = verifiedAt ? daysSince(verifiedAt) : 0;
	const stillPending =
		!verifiedAt ||
		(!draft.alwaysAnswered && chance(Math.max(0, 1 - age / MODERATION_WINDOW_DAYS) ** 0.5));

	let status: ModerationStatus = 'pending';
	let moderatedAt: Date | null = null;
	let emailToken: string | null = null;

	if (verifiedAt && !stillPending) {
		status = draft.alwaysAnswered || chance(APPROVAL_SHARE) ? 'approved' : 'rejected';
		moderatedAt = addDelay(verifiedAt, 1, 96);
		if (moderatedAt > NOW) moderatedAt = new Date(NOW.getTime() - between(1, 60) * 60 * 1000);
		if (status === 'approved') emailToken = randomUUID();
	}

	let answeredAt: Date | null = null;

	if (status === 'approved' && moderatedAt) {
		const sinceApproval = daysSince(moderatedAt);
		const probability = ANSWER_BY_AGE.find(([days]) => sinceApproval >= days)?.[1] ?? 0.07;

		if (draft.alwaysAnswered || chance(probability)) {
			// 2 to 21 days, weighted towards the short end
			const candidate = new Date(moderatedAt.getTime() + (2 + 19 * Math.random() ** 2) * DAY);
			if (candidate < NOW) answeredAt = candidate;
		}
	}

	questionRows.push({
		id: questionId,
		userId: asker.id,
		body: draft.body,
		status,
		createdAt,
		updatedAt: answeredAt ?? moderatedAt ?? verifiedAt ?? createdAt,
		title: draft.title,
		slug,
		assigneeId: politician.userId,
		assigneeFractionId: politician.fractionId,
		verifiedAt,
		emailToken
	});

	if (!signedIn) {
		enqueue({
			kind: 'magic-link',
			recipient: asker.email,
			subject: 'Bevestig je vraag op VraagHetZe',
			body: `Met dit e-mailadres is een vraag gesteld op VraagHetZe. Was jij dat? Bevestig je vraag via deze link: ${magicLink(`${ORIGIN}/vragen/${slug}?doel=bevestigen`)}`,
			expiresAt: new Date(createdAt.getTime() + MAGIC_LINK_EXPIRY),
			createdAt
		});
	} else if (previousAsk && daysSince(previousAsk) - daysSince(createdAt) > SESSION_DAYS) {
		// the session from the previous ask has expired, so they logged in via /inloggen
		// shortly before asking, which words the same link as a login
		const signedInAt = new Date(createdAt.getTime() - between(2, 20) * 60 * 1000);

		enqueue({
			kind: 'magic-link',
			recipient: asker.email,
			subject: 'Je inloglink voor VraagHetZe',
			body: `Log hier in: ${magicLink(`${ORIGIN}/inloggen`)}`,
			expiresAt: new Date(signedInAt.getTime() + MAGIC_LINK_EXPIRY),
			createdAt: signedInAt
		});
	}

	if (moderatedAt) {
		moderationRows.push({
			id: randomUUID(),
			moderatorId: pick(admins).id,
			questionId,
			answerId: null,
			action: status,
			// the queue form only submits a note today, so this column has no writer yet. it is
			// filled here so the archive already shows what it will look like once it does
			rejectionReason: status === 'rejected' && chance(0.6) ? pick(Object.keys(allRejectionReasons)) : null,
			note: chance(status === 'rejected' ? 0.65 : 0.25)
				? pick(status === 'rejected' ? rejectionNotes : approvalNotes)
				: null,
			createdAt: moderatedAt
		});

		if (status === 'approved') {
			politicianByQuestion.set(questionId, politician);

			enqueue({
				kind: 'question-notification',
				questionId,
				recipient: resolveMailAddress(politician.email),
				replyTo: `antwoord+${emailToken}@${EMAIL_DOMAIN}`,
				subject: `Nieuwe vraag via VraagHetZe van ${asker.name}`,
				body: [
					`Beste ${politician.name},`,
					`${asker.name} stelt u via VraagHetZe de volgende vraag:`,
					`"${draft.title}"`,
					`"${draft.body}"`,
					`U kunt antwoorden door simpelweg deze e-mail te beantwoorden. Uw antwoord wordt eerst door onze moderatoren gecontroleerd en verschijnt daarna openbaar bij de vraag op ${ORIGIN}/vragen/${slug}.`,
					`Met vriendelijke groet,\nHet VraagHetZe-team`
				].join('\n\n'),
				createdAt: moderatedAt
			});

			enqueue({
				kind: 'moderation-notification',
				questionId,
				recipient: asker.email,
				subject: 'Je vraag op VraagHetZe is goedgekeurd',
				body: [
					`Beste ${asker.name},`,
					`Je vraag "${draft.title}" is goedgekeurd door onze moderatoren en doorgestuurd naar ${politician.name}. Je vraag staat nu openbaar op ${ORIGIN}/vragen/${slug}.`,
					`Zodra ${politician.name} antwoordt, ontvang je daarvan een e-mail.`,
					`Met vriendelijke groet,\nHet VraagHetZe-team`
				].join('\n\n'),
				createdAt: moderatedAt
			});
		} else {
			enqueue({
				kind: 'moderation-notification',
				questionId,
				recipient: asker.email,
				subject: 'Je vraag op VraagHetZe is niet goedgekeurd',
				body: [
					`Beste ${asker.name},`,
					`Je vraag "${draft.title}" is beoordeeld door onze moderatoren en helaas niet goedgekeurd, omdat deze niet voldeed aan de spelregels. De vraag is daarom niet doorgestuurd en wordt niet openbaar gemaakt.`,
					`Je kunt altijd een nieuwe vraag stellen via ${ORIGIN}/vragen/stellen.`,
					`Met vriendelijke groet,\nHet VraagHetZe-team`
				].join('\n\n'),
				createdAt: moderatedAt
			});
		}
	}

	if (!answeredAt) continue;

	const answerId = randomUUID();
	const voice = pick(answerVoices);
	const fraction = politician.fractionRole === 'chair' ? 'fractievoorzitter' : 'lid';

	const body = draft.listAnswer
		? `${listAnswer}\n${politician.name}`
		: [
				voice.open(asker.name),
				draft.answer,
				pick(closingLines),
				voice.close(politician.name, fraction)
			]
				.filter(Boolean)
				.join('\n\n');

	// the answer is written the moment the mail lands and only goes public once a moderator
	// approves it
	const publishedAt = new Date(Math.min(addDelay(answeredAt, 1, 36).getTime(), NOW.getTime()));

	answerRows.push({
		id: answerId,
		userId: politician.userId,
		body,
		status: 'approved',
		createdAt: answeredAt,
		updatedAt: publishedAt,
		questionId
	});

	moderationRows.push({
		id: randomUUID(),
		moderatorId: pick(admins).id,
		questionId: null,
		answerId,
		action: 'approved',
		rejectionReason: null,
		// only the automatic rejection in moderation.ts writes a note on an answer
		note: null,
		createdAt: publishedAt
	});

	const from = resolveMailAddress(politician.email).toLowerCase();
	const to = `antwoord+${emailToken}@${EMAIL_DOMAIN}`;
	const subject = `RE: Nieuwe vraag via VraagHetZe van ${asker.name}`;
	const text = `${body}\n\n-----Oorspronkelijk bericht-----\nVan: VraagHetZe <noreply@${EMAIL_DOMAIN}>\nOnderwerp: Nieuwe vraag via VraagHetZe van ${asker.name}`;
	const payload = inboundPayload(from, to, subject, text, passingDkim(from));

	inboxRows.push({
		id: randomUUID(),
		dedupKey: dedupKey(payload),
		fromAddress: from,
		token: emailToken,
		subject,
		dkimVerified: true,
		payload,
		status: 'processed',
		reason: null,
		answerId,
		receivedAt: answeredAt,
		processedAt: new Date(answeredAt.getTime() + between(200, 2000))
	});

	enqueue({
		kind: 'answer-notification',
		questionId,
		recipient: asker.email,
		subject: 'Je vraag op VraagHetZe is beantwoord',
		body: [
			`Beste ${asker.name},`,
			`Je vraag "${draft.title}" is beantwoord door ${politician.name}. Je kunt het antwoord lezen op ${ORIGIN}/vragen/${slug}.`,
			`Met vriendelijke groet,\nHet VraagHetZe-team`
		].join('\n\n'),
		createdAt: publishedAt
	});
}

// the newest answers have not been moderated yet, so they are not public: the approval row
// and the mail to the asker are taken back out. this is what fills the answer queue
const waitingAnswers = [...answerRows]
	.sort((left, right) => right.createdAt!.getTime() - left.createdAt!.getTime())
	.slice(0, ANSWERS_IN_QUEUE);

for (const answer of waitingAnswers) {
	answer.status = 'pending';
	answer.updatedAt = answer.createdAt;

	const approval = moderationRows.findIndex((row) => row.answerId === answer.id);
	moderationRows.splice(approval, 1);

	const notification = outboxRows.findIndex(
		(mail) => mail.kind === 'answer-notification' && mail.questionId === answer.questionId
	);
	outboxRows.splice(notification, 1);
}

// --- stray inbound mail ---

const approvedQuestions = questionRows.filter((question) => question.status === 'approved');

// a waiting answer does not count: processMail only refuses a reply once one was published
const answeredIds = new Set(
	answerRows.filter((answer) => answer.status === 'approved').map((answer) => answer.questionId)
);

const answeredQuestions = approvedQuestions.filter((question) => answeredIds.has(question.id!));
const unansweredQuestions = approvedQuestions.filter((question) => !answeredIds.has(question.id!));

// the only address processMail accepts a reply from, diversion included
const politicianAddress = (question: QuestionRow) =>
	resolveMailAddress(politicianByQuestion.get(question.id!)!.email).toLowerCase();

// every reason processMail can settle a mail on. each row has to survive the checks that
// run before its own, otherwise the reason here is not the one the real pipeline would
// have written. the reply address and the signature follow from the question, so a row
// only spells out what sets it apart. ASSIGNEE sends from the Kamerlid's own address, and
// target picks which question is replied to, an unanswered one by default
const ASSIGNEE = 'assignee';

const strays: {
	reason: string | null;
	status: InboxStatus;
	from: string;
	text: string;
	target?: 'answered' | 'unknown' | 'none';
	subject?: string;
	dkim?: string;
	headers?: string[];
}[] = [
	{
		reason: 'Geen antwoordtoken in adres',
		status: 'ignored',
		target: 'none',
		from: 'nieuwsbrief@vngmagazine.nl',
		subject: 'Uw wekelijkse update van VNG Magazine',
		text: 'Bekijk de nieuwsbrief online.'
	},
	{
		reason: 'Automatisch antwoord',
		status: 'ignored',
		from: 'afwezig@tweedekamer.nl',
		subject: 'Automatisch antwoord: Nieuwe vraag via VraagHetZe',
		text: 'Ik ben tot en met volgende week niet bereikbaar. Voor dringende zaken kunt u contact opnemen met de fractiemedewerker.',
		// what isAutoReply actually looks for; the subject alone means nothing to it
		headers: ['Auto-Submitted: auto-replied', 'Precedence: bulk']
	},
	{
		reason: 'Afzender niet geverifieerd',
		status: 'ignored',
		from: 'kamerlid@tweedekamer.nl.example.net',
		text: 'Bij dezen mijn antwoord op de gestelde vraag.',
		// signed by a domain that isn't the from domain, so alignment fails
		dkim: '{@example.net : fail}'
	},
	{
		reason: 'Vraag onbekend',
		status: 'ignored',
		target: 'unknown',
		from: 'medewerker@tweedekamer.nl',
		text: 'Wij hebben deze vraag intern doorgezet.'
	},
	{
		reason: 'Vraag al beantwoord',
		status: 'ignored',
		target: 'answered',
		// checked before the sender, so a fraction employee gets this far
		from: 'medewerker@tweedekamer.nl',
		text: 'Nog een kleine aanvulling op mijn eerdere antwoord.'
	},
	{
		reason: 'Afzender is niet het Kamerlid',
		status: 'ignored',
		from: 'voorlichting@tweedekamer.nl',
		text: 'Namens het Kamerlid stuur ik u onderstaand antwoord.'
	},
	{
		// the last check before an answer is written, so this one has to be the Kamerlid
		reason: 'Leeg antwoord',
		status: 'ignored',
		from: ASSIGNEE,
		text: '-----Oorspronkelijk bericht-----\nVan: VraagHetZe\nOnderwerp: Nieuwe vraag via VraagHetZe'
	},
	{
		// a throw during processing, so it too got past every check
		reason: 'Kon bijlage niet verwerken: onverwacht einde van de invoer',
		status: 'failed',
		from: ASSIGNEE,
		text: 'Zie bijgaand document voor het antwoord.'
	},
	{
		// never settled at all, the state a crashed worker leaves behind
		reason: null,
		status: 'received',
		from: ASSIGNEE,
		text: 'Hierbij het antwoord van het Kamerlid.'
	}
];

// a thinner second round, so a reason can show up more than once in the list
for (const [index, stray] of [...strays, ...strays.filter(() => chance(0.6))].entries()) {
	const question =
		stray.target === 'none'
			? null
			: pick(stray.target === 'answered' ? answeredQuestions : unansweredQuestions);

	// a token that parses fine but matches no question, e.g. a reply to a deleted one
	const token = stray.target === 'unknown' ? randomUUID() : (question?.emailToken ?? null);

	const from = stray.from === ASSIGNEE ? politicianAddress(question!) : stray.from;
	const to = question ? `antwoord+${token}@${EMAIL_DOMAIN}` : `info@${EMAIL_DOMAIN}`;
	const subject = stray.subject ?? 'RE: Nieuwe vraag via VraagHetZe';
	const dkim = stray.dkim ?? passingDkim(from);

	const unsettled = stray.status === 'received';
	const receivedAt = new Date(
		NOW.getTime() - (unsettled ? between(0.01, 0.1) : between(0.5, SPAN_DAYS * 0.8)) * DAY
	);

	const payload = inboundPayload(from, to, subject, stray.text, dkim, stray.headers);

	inboxRows.push({
		id: randomUUID(),
		dedupKey: dedupKey({ ...payload, subject: `${subject} #${index}` }),
		fromAddress: from,
		token,
		subject,
		// mirrors isSenderVerified: a passing signature placed by exactly the from domain
		dkimVerified: dkim === passingDkim(from),
		payload,
		status: stray.status,
		reason: stray.reason,
		answerId: null,
		receivedAt,
		processedAt: unsettled ? null : new Date(receivedAt.getTime() + between(200, 3000))
	});
}

// the newest mails are still waiting for the sweep, one is retrying after a transient
// failure and one was left mid-send by a worker that died
{
	const newest = [...outboxRows]
		.filter((mail) => mail.status === 'sent')
		.sort((left, right) => right.createdAt!.getTime() - left.createdAt!.getTime());

	for (const mail of newest.slice(0, 3)) {
		mail.status = 'queued';
		mail.attempts = 0;
		mail.sentAt = null;
		mail.nextAttemptAt = mail.createdAt;
	}

	const retrying = newest[3];
	if (retrying) {
		retrying.status = 'queued';
		retrying.attempts = 2;
		retrying.sentAt = null;
		retrying.lastError = 'Failed to send email: 429 Too many requests';
		// matches the exponential backoff in outbox.ts: 2^attempts * 5 minutes
		retrying.nextAttemptAt = new Date(retrying.createdAt!.getTime() + 4 * 5 * 60 * 1000);
	}

	const stalled = newest[4];
	if (stalled) {
		stalled.status = 'sending';
		stalled.attempts = 1;
		stalled.sentAt = null;
		stalled.nextAttemptAt = new Date(stalled.createdAt!.getTime() + 5 * 60 * 1000);
	}
}

const askerRows = askers
	.filter((asker) => askerFirstAsk.has(asker.id))
	.map((asker) => {
		// the ask flow creates the account moments before the question lands, unverified
		// until the magic link is followed
		const createdAt = new Date(askerFirstAsk.get(asker.id)!.getTime() - between(5, 90) * 1000);
		return {
			id: asker.id,
			name: asker.name,
			email: asker.email,
			emailVerified: askersConfirmed.has(asker.id),
			createdAt,
			updatedAt: createdAt,
			role: null
		};
	});

// the admins first, the moderation actions point at them
const userRows = [...admins, ...askerRows];

const chunked = <T>(rows: T[], size = 500) =>
	Array.from({ length: Math.ceil(rows.length / size) }, (_, index) =>
		rows.slice(index * size, index * size + size)
	);

// --- sql export ---

const quote = (text: string) => `'${text.replaceAll("'", "''")}'`;

function literal(value: unknown): string {
	if (value === null || value === undefined) return 'null';
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') return String(value);
	// timestamp columns carry no zone and postgres drops the offset while parsing, so the
	// iso string lands as the same wall time postgres.js writes here
	if (value instanceof Date) return quote(value.toISOString());
	if (typeof value === 'object') return `${quote(JSON.stringify(value))}::jsonb`;
	return quote(String(value));
}

// mirrors `casing: 'snake_case'` on the drizzle client, which is what maps the schema's
// property names onto the columns
const columnName = (property: string) =>
	property.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

// a politician's user id is a fresh uuid on the first sync, so it differs per database.
// the export resolves those columns at apply time from the Tweede Kamer id, which does not
// differ. the admin accounts need no such treatment, the export inserts them itself
const politicianIdByUser = new Map(politicians.map((row) => [row.userId, row.id]));

const resolvePolitician = (userId: string) =>
	`(select user_id from politician where id = ${literal(politicianIdByUser.get(userId))})`;

type References = Partial<Record<string, (value: string) => string>>;

function insertInto(table: Table, rows: Record<string, unknown>[], references: References = {}) {
	if (rows.length === 0) return [];

	const properties = Object.keys(rows[0]);
	const columns = properties.map((property) => `"${columnName(property)}"`).join(', ');
	const header = `insert into "${getTableName(table)}" (${columns}) values`;

	return chunked(rows).map((chunk) => {
		const values = chunk.map((row) => {
			const cells = properties.map((property) => {
				const reference = references[property];
				return reference && row[property] !== null
					? reference(row[property] as string)
					: literal(row[property]);
			});
			return `\t(${cells.join(', ')})`;
		});

		return `${header}\n${values.join(',\n')};`;
	});
}

function exportSql() {
	const kamerIds = [
		...new Set(questionRows.map((question) => politicianIdByUser.get(question.assigneeId)!))
	];

	// fail before deleting anything if this database is not the one the export was built for
	const guard = `do $$
begin
	if exists (
		select 1 from unnest(array[${kamerIds.map(literal).join(', ')}]) as wanted(id)
		where not exists (select 1 from politician where politician.id = wanted.id)
	) then
		raise exception 'seed: onbekende Kamerleden, draai eerst de sync';
	end if;
end $$;`;

	return [
		`-- Generated by src/lib/server/db/seed.ts on ${NOW.toISOString()}, do not edit by hand.`,
		`-- ORIGIN=${ORIGIN} EMAIL_DOMAIN=${EMAIL_DOMAIN} DIVERSION_EMAIL=${DIVERSION_EMAIL || '(leeg)'}`,
		`-- The timeline runs ${SPAN_DAYS} days back from the date above.`,
		'--',
		'-- Needs a database that ran the migrations and the politician sync. Wipes questions,',
		'-- answers, moderation, mail and every account the sync does not own, then recreates',
		`-- the admin logins: ${ADMINS.map((admin) => admin.email).join(', ')}.`,
		'--',
		'--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seed.sql',
		'',
		'begin;',
		'',
		// the jsonb payloads below carry escapes that only mean themselves with this on
		"set local standard_conforming_strings = 'on';",
		'',
		guard,
		'',
		...WIPE.map((statement) => `${statement};`),
		'',
		...insertInto(schema.user, userRows),
		...insertInto(schema.question, questionRows, { assigneeId: resolvePolitician }),
		...insertInto(schema.answer, answerRows, { userId: resolvePolitician }),
		...insertInto(schema.moderationAction, moderationRows),
		...insertInto(schema.outbox, outboxRows),
		...insertInto(schema.inbox, inboxRows),
		'',
		'commit;',
		''
	].join('\n');
}

if (sqlFile) {
	await writeFile(sqlFile, exportSql());
} else {
	await db.transaction(async (tx) => {
		for (const statement of WIPE) await tx.execute(sql.raw(statement));

		for (const chunk of chunked(userRows)) await tx.insert(schema.user).values(chunk);
		for (const chunk of chunked(questionRows)) await tx.insert(schema.question).values(chunk);
		for (const chunk of chunked(answerRows)) await tx.insert(schema.answer).values(chunk);
		for (const chunk of chunked(moderationRows))
			await tx.insert(schema.moderationAction).values(chunk);
		for (const chunk of chunked(outboxRows)) await tx.insert(schema.outbox).values(chunk);
		for (const chunk of chunked(inboxRows)) await tx.insert(schema.inbox).values(chunk);
	});
}

const [commissions] = await db
	.select({ covered: countDistinct(schema.commissionMembership.politicianId) })
	.from(schema.commissionMembership);

await client.end();

const count = (predicate: (question: QuestionRow) => boolean) =>
	questionRows.filter(predicate).length;

console.log(`${sqlFile ? `wrote ${sqlFile}, this database was left untouched` : 'seeded'}

questions          ${questionRows.length} over ${SPAN_DAYS} days
  unverified       ${count((question) => !question.verifiedAt)}
  in the queue     ${count((question) => question.status === 'pending' && !!question.verifiedAt)}
  approved         ${count((question) => question.status === 'approved')}
  rejected         ${count((question) => question.status === 'rejected')}
answers            ${answerRows.length}, of which ${waitingAnswers.length} in the queue
askers             ${askerRows.length}, of which ${askerRows.filter((asker) => !asker.emailVerified).length} never confirmed
politicians asked  ${new Set(questionRows.map((question) => question.assigneeId)).size} of ${politicians.length}
in a commission    ${commissions.covered} of ${politicians.length}
moderation actions ${moderationRows.length}
outbox             ${outboxRows.length}
inbox              ${inboxRows.length}`);

if (commissions.covered === 0) {
	console.log('\nno commission memberships, run the sync for the filter on /politici');
}
