# VraagHetZe

[VraagHetZe](https://vraaghetze.nu/) is a public website for asking questions to politicians in the Tweede Kamer.

## Technology

- [SvelteKit](https://svelte.dev/docs/kit) and [Svelte 5](https://svelte.dev) in [TypeScript](https://www.typescriptlang.org)
- [Docker](https://www.docker.com) with SvelteKit [Node adapter](https://svelte.dev/docs/kit/adapter-node)
- [PostgreSQL](https://www.postgresql.org) with [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://www.better-auth.com) for user management in local database
- [SendGrid](https://www.twilio.com/docs/sendgrid) for outgoing and incoming email
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Bits UI](https://bits-ui.com) for unstyled components
- [Vitest](https://vitest.dev) for testing
- [Croner](https://croner.56k.guru) for the background jobs
- [sharp](https://sharp.pixelplumbing.com) for scaling politician images

## Development

Make sure you have Node, pnpm and Docker installed.

1. Copy `.env.example` to `.env`. A development environment needs values for `POSTGRES_*`, `DATABASE_URL`, `ORIGIN` and `BETTER_AUTH_SECRET`. Keep the other keys in the file empty.

1. Install the dependencies:

   ```bash
   pnpm install
   ```

1. Start the database:

   ```bash
   pnpm db:start
   ```


1. Push the schema to the database:

   ```bash
   pnpm db:push
   ```

1. Activate the `pg_trgm` extension:

   ```bash
   docker compose -f docker-compose.dev.yml exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm"'
   ```

1. Create `static/fonts/azurio.woff2`.

1. Start the development server:

   ```bash
   pnpm dev
   ```

1. Open http://localhost:5173 and wait for the logs to show the politician sync is done.

1. Fill the database with test data:

   ```bash
   pnpm db:seed
   ```

1. Run the tests once:

    ```bash
    pnpm test:setup
    ```

1. To elevate a user to the `admin` role you can use `bin/make_admin.sh`


## Commands

| Command            | Function                                                        |
| ------------------ | --------------------------------------------------------------- |
| `pnpm dev`         | Start the development server.                                   |
| `pnpm build`       | Make a production build.                                        |
| `pnpm check`       | Do the TypeScript and Svelte checks.                            |
| `pnpm lint`        | Do the Prettier and ESLint checks.                              |
| `pnpm format`      | Correct the format of all files.                                |
| `pnpm test`        | Do the tests. The database must run.                            |
| `pnpm test:setup`  | Make the test database again. Necessary after a schema change.  |
| `pnpm db:start`    | Start the local database in Docker.                             |
| `pnpm db:push`     | Write the schema to the local database. For local use only.     |
| `pnpm db:seed`     | Fill the local database with test data. For local use only.     |
| `pnpm db:generate` | Make a migration file from a schema change. For production.     |
| `pnpm db:studio`   | Open Drizzle Studio on the database. For local use only.        |
| `pnpm auth:schema` | Make `auth.schema.ts` again from the Better Auth configuration. |

## Architecture

### Question flow

1. A person writes a question in the steps of `/vragen/stellen`. The server makes a user account for the email address or finds the existing account.
2. The server sends a magic link. The person clicks the link. The server then sets `verifiedAt` on the question. Only a verified question goes to the moderators.
3. A moderator approves or rejects the question on `/modereren/vragen`.
4. The server puts an email for the politician in the `outbox` table. The delivery job sends the email through SendGrid.
5. The politician answers by email. SendGrid sends the answer to `/api/sendgrid/inbound`. The email is matched to a question based on the unique `emailToken` in the address. The server writes the answer in the `inbox` table, and makes an `answer` row with the status `pending`.
6. A moderator approves or rejects the answer on `/modereren/antwoorden`.
7. At approval the website publishes the answer. The server also puts an email in the outbox for the person who asked the question, and for each follower.

### Codebase

| Directory              | Contents                                         |
| ---------------------- | ------------------------------------------------ |
| `src/routes`           | Page components, loaders and form actions.       |
| `src/lib/components`   | Re-used Svelte components.                       |
| `src/lib/server/db`    | Database schema and connection.                  |
| `src/lib/server/email` | Inbox and outbox management and email templates. |
| `src/lib/server/sync`  | Importing of politicians from Tweede Kamer.      |
| `src/lib/server`       | Other server logic per subject.                  |
| `drizzle`              | Auto-generated migration files.                  |

### Database

Every person is a `user`, whether they ask a question, answer one as a politician, or moderate. Better Auth manages `user`, `session`, `account` and `verification`. A politician has a `politician` row next to their user row, which points at their `fraction` and, through `commission_membership`, at each `commission` they are a member of.

A `question` points at the user who wrote it and at the politician it is assigned to, and keeps `assigneeFractionId` as a snapshot of the fraction at that moment. An `answer` belongs to one question. `question_follow` holds the followers of a question. `moderation_action` records each approval and rejection of questions and answers. `outbox` and `inbox` hold the outgoing and incoming email.

Make a migration file with `pnpm db:generate` after each schema change and commit it. Edit manually if needed to make it backwards-compatible.

### Search

There is no external search service. The `question` and `answer` tables have a generated `searchVector` column that holds the text of the row as searchable words. The search on `/vragen` joins the vectors of a question and its newest answer as one document. The related questions below a question match against the same joined vector. The vectors use the Dutch text search configuration of PostgreSQL. That configuration keeps Dutch compound words together, thus `src/lib/server/search` also matches parts of a word, such that "klimaat" or "beleid" finds "klimaatbeleid". The search on `/politici` uses no vectors, it matches the name of the politician directly.

### Politician sync

`src/lib/server/sync` reads the politicians from the open data of the Tweede Kamer and stores them in the `politician` table. A politician without an email address is skipped. The sync also sets the `fraction`, `commission` and `commission_membership` tables.

The sync never deletes a politician. A politician who leaves the Tweede Kamer gets `isActive = false`, such that old questions keep their assignee. The sync fetches user images for a politician without one, and stores it as a 256px WebP data URL in `user.image`.

### Email

The server never sends an email directly without it going through the `outbox` table. This makes retries and a full history possible. Some emails, such as an answer notification, are enqueued for delivery by the background job, others, such as magic links, are enqueued and sent immediately. In development, the server writes each email to the console and sends nothing through SendGrid. Set `DIVERSION_EMAIL` in production to divert emails away from politicians, before launch.

Incoming email arrives via a webhook by Sendgrid to `/api/sendgrid/inbound`. If the endpoint is down, SendGrid retries for 72 hours. All emails are stored in the `inbox` table. The webhook has a token in the URL to secure the endpoint. SvelteKit's default CSRF check and the basic authentication skip this route.

### Background jobs

`src/hooks.server.ts` starts two cron jobs at the start of the server:

- The politician sync, each day at 04:00.
- The outbox queue delivery, every 5 minutes.

Both jobs also run once when the server handles its first request.

## Deployment

`docker-compose.yml` defines three services: the database, a migration container and the application. The migration container automatically applies new database migrations and then stops. The application starts after that. Docker Compose reads `.env`.

To deploy, on the server:

1. `git pull`

2. `sudo docker compose build node`

3. `sudo docker compose up -d`

## Before the launch

- Make `DIVERSION_EMAIL` empty. Real politicians then get the emails.
- Make `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` empty.
- Remove `handleBasicAuth` from `src/hooks.server.ts`.
