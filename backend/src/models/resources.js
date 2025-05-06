const { pgTable, uuid, text, timestamp } = require('drizzle-orm/pg-core');
const users = require('./users');
const assignments = require('./assignments');

const resources = pgTable('resources', {
  id:            uuid('id').primaryKey().defaultRandom(),
  mentor_id:     uuid('mentor_id').references(() => users.id).notNull(),
  assignment_id: uuid('assignment_id').references(() => assignments.id),
  title:         text('title').notNull(),
  url:           text('url').notNull(),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

module.exports = resources;