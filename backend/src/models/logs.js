const { pgTable, uuid, text, timestamp, boolean } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const users = require('./users');

const logs = pgTable('logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // CREATE, READ, UPDATE, DELETE
  entity_type: text('entity_type').notNull(), // users, assignments, resources, submissions, comments
  entity_id: uuid('entity_id').notNull(),
  details: text('details'), // Additional info about the operation
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

module.exports = logs; 