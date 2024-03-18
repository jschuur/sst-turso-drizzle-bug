import 'dotenv/config';

import { db } from './db';
import { users } from './schema';

(async () => {
  await db.insert(users).values({ name: 'Bobby' }).onConflictDoNothing();
  await db.insert(users).values({ name: 'Mo' }).onConflictDoNothing();
  await db.insert(users).values({ name: 'Joost' }).onConflictDoNothing();

  console.log(`\nDone!`);
})();
