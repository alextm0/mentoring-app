const db = require('../config/database');
const { submissions, assignments, users } = require('../models');
const { eq, and } = require('drizzle-orm');

const findById = async (id) => {
  return await db.select().from(submissions).where(eq(submissions.id, id)).limit(1).then(rows => rows[0]);
};

const findAllByAssignmentId = async (assignmentId) => {
  return await db.select().from(submissions).where(eq(submissions.assignment_id, assignmentId));
};

const findAllByMenteeId = async (menteeId) => {
  return await db.select().from(submissions).where(eq(submissions.mentee_id, menteeId));
};

const create = async (data) => {
  return await db.insert(submissions).values(data).returning().then(rows => rows[0]);
};

const update = async (id, data) => {
  return await db
    .update(submissions)
    .set({ ...data })
    .where(eq(submissions.id, id))
    .returning()
    .then(rows => rows[0]);
};

const remove = async (id) => {
  return await db.delete(submissions).where(eq(submissions.id, id)).returning().then(rows => rows[0]);
};

module.exports = {
  findById,
  findAllByAssignmentId,
  findAllByMenteeId,
  create,
  update,
  remove,
};