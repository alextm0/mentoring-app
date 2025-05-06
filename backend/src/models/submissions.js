const { pgTable, uuid, text, boolean, timestamp } = require('drizzle-orm/pg-core');
const users = require('./users');
const assignments = require('./assignments');

const submissions = pgTable('submissions', {
  id:            uuid('id').primaryKey().defaultRandom(),
  assignment_id: uuid('assignment_id').references(() => assignments.id).notNull(),
  mentee_id:     uuid('mentee_id').references(() => users.id).notNull(),
  snippet:       text('snippet').notNull(),
  completed:     boolean('completed').default(false),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

module.exports = submissions;