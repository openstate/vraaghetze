import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as appSchema from './app.schema';
import * as authSchema from './auth.schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const schema = { ...authSchema, ...appSchema }; // do not change order

export const db = drizzle(client, { schema, casing: 'snake_case' });
