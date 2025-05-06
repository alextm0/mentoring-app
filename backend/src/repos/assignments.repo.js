const db = require('../config/database');
const { assignments } = require('../models');
const { eq } = require('drizzle-orm');

const findById = async (id) => {
  return await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1)
    .then(rows => rows[0]);
};

const findAllByMentorId = async (mentorId) => {
  return await db
    .select()
    .from(assignments)
    .where(eq(assignments.mentor_id, mentorId));
};

const create = async (data) => {
  return await db
    .insert(assignments)
    .values(data)
    .returning()
    .then(rows => rows[0]);
};

const update = async (id, data) => {
  // assignments only have title + description to update
  const updatable = ['title','description'];
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([k]) => updatable.includes(k))
  );

  return await db
    .update(assignments)
    .set(updateData)
    .where(eq(assignments.id, id))
    .returning()
    .then(rows => rows[0]);
};

const remove = async (id) => {
  return await db
    .delete(assignments)
    .where(eq(assignments.id, id))
    .returning()
    .then(rows => rows[0]);
};

module.exports = {
  findById,
  findAllByMentorId,
  create,
  update,
  remove,
};
