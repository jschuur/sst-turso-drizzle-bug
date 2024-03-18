import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').notNull().primaryKey(),
  name: text('name').notNull(),
});
