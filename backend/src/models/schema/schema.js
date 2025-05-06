const { pgTable, uuid, text, timestamp, boolean, integer } = require('drizzle-orm/pg-core');

// Users table
const users = pgTable('users', {
  id:            uuid('id').primaryKey().defaultRandom(),
  email:         text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role:          text('role').notNull(),
  mentor_id:     uuid('mentor_id').references(() => users.id),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Assignments table
const assignments = pgTable('assignments', {
  id:          uuid('id').primaryKey().defaultRandom(),
  mentor_id:   uuid('mentor_id').references(() => users.id).notNull(),
  title:       text('title').notNull(),
  description: text('description'),
  created_at:  timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Resources table
const resources = pgTable('resources', {
  id:            uuid('id').primaryKey().defaultRandom(),
  mentor_id:     uuid('mentor_id').references(() => users.id).notNull(),
  assignment_id: uuid('assignment_id').references(() => assignments.id),
  title:         text('title').notNull(),
  url:           text('url').notNull(),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Submissions table
const submissions = pgTable('submissions', {
  id:            uuid('id').primaryKey().defaultRandom(),
  assignment_id: uuid('assignment_id').references(() => assignments.id).notNull(),
  mentee_id:     uuid('mentee_id').references(() => users.id).notNull(),
  snippet:       text('snippet').notNull(),
  completed:     boolean('completed').default(false),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Comments table
const comments = pgTable('comments', {
  id:            uuid('id').primaryKey().defaultRandom(),
  submission_id: uuid('submission_id').references(() => submissions.id).notNull(),
  mentor_id:     uuid('mentor_id').references(() => users.id).notNull(),
  line_number:   integer('line_number'),
  comment:       text('comment').notNull(),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
});

module.exports = {
  users,
  assignments,
  resources,
  submissions,
  comments,
};
