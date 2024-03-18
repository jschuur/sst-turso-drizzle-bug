import { ApiHandler } from 'sst/node/api';

import { db } from './db';
import { users } from './schema';

export const handler = ApiHandler(async () => {
  const res = await db.select().from(users);

  return {
    statusCode: 200,
    body: JSON.stringify(res, null, 2),
  };
});
