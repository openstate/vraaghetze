import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as appSchema from './app.schema';
import * as authSchema from './auth.schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const client = postgres(process.env.DATABASE_URL);

export const schema = { ...authSchema, ...appSchema }; // do not change order

export const casing = 'snake_case';

export const db = drizzle(client, { schema, casing });

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
