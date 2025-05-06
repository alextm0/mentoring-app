const db = require('../config/database');
const { resources, assignments, users } = require('../models');
const { eq, and } = require('drizzle-orm');

const findById = async (id) => {
  return await db.select().from(resources).where(eq(resources.id, id)).limit(1).then(rows => rows[0]);
};

const findAllByMentorId = async (mentorId) => {
  return await db.select().from(resources).where(eq(resources.mentor_id, mentorId));
};

const findAllByAssignmentId = async (assignmentId) => {
  return await db.select().from(resources).where(eq(resources.assignment_id, assignmentId));
};

const create = async (data) => {
  return await db.insert(resources).values(data).returning().then(rows => rows[0]);
};

const update = async (id, data) => {
  return await db
    .update(resources)
    .set({ ...data })
    .where(eq(resources.id, id))
    .returning()
    .then(rows => rows[0]);
};

const remove = async (id) => {
  return await db.delete(resources).where(eq(resources.id, id)).returning().then(rows => rows[0]);
};

module.exports = {
  findById,
  findAllByMentorId,
  findAllByAssignmentId,
  create,
  update,
  remove,
};