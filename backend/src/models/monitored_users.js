const { pgTable, uuid, text, timestamp, integer, boolean } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const users = require('./users');

const monitored_users = pgTable('monitored_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  operation_count: integer('operation_count').notNull(),
  time_period: text('time_period').notNull(), // e.g., "last_24_hours", "last_hour"
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  resolved_at: timestamp('resolved_at'),
  resolved_by: uuid('resolved_by').references(() => users.id),
  resolution_notes: text('resolution_notes'),
});

module.exports = monitored_users; 