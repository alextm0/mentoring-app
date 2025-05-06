const { pgTable, uuid, text, timestamp } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const users = require('./users');

const assignments = pgTable('assignments', {
  id:          uuid('id').primaryKey().defaultRandom(),
  mentor_id:   uuid('mentor_id').references(() => users.id).notNull(),
  title:       text('title').notNull(),
  description: text('description'),
  created_at:  timestamp('created_at', { withTimezone: true }).defaultNow(),
});

module.exports = assignments;