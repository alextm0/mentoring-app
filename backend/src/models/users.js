const { pgTable, uuid, text, timestamp, boolean, integer } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const { check } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id:            uuid('id').primaryKey().defaultRandom(),
  email:         text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role:          text('role').notNull(),
  mentor_id:     uuid('mentor_id').references(() => users.id),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

module.exports = users;
