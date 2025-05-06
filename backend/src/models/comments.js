const { pgTable, uuid, text, integer, timestamp } = require('drizzle-orm/pg-core');
const users = require('./users');
const submissions = require('./submissions');

const comments = pgTable('comments', {
  id:            uuid('id').primaryKey().defaultRandom(),
  submission_id: uuid('submission_id').references(() => submissions.id).notNull(),
  mentor_id:     uuid('mentor_id').references(() => users.id).notNull(),
  line_number:   integer('line_number'),
  comment:       text('comment').notNull(),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

module.exports = comments;