import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema';

// Turso setup https://orm.drizzle.team/learn/tutorials/drizzle-with-turso
const authToken = process.env.TURSO_AUTH_TOKEN;
const url = process.env.TURSO_CONNECTION_URL;

if (!url) {
  throw new Error('TURSO_CONNECTION_URL is not defined');
}

if (url?.startsWith('libsql://') && !authToken) {
  throw new Error('TURSO_AUTH_TOKEN is not defined');
}

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
