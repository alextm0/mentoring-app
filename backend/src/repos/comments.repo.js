const db = require('../config/database');
const { comments, users } = require('../models');
const { eq } = require('drizzle-orm');

const findById = async (id) => {
  return await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1)
    .then(rows => rows[0]);
};

const findAllBySubmissionId = async (submissionId) => {
  return await db
    .select({
      ...comments,
      mentor_email: users.email
    })
    .from(comments)
    .innerJoin(users, eq(comments.mentor_id, users.id))
    .where(eq(comments.submission_id, submissionId))
    .orderBy(comments.line_number, comments.created_at);
};

const findAllByMentorId = async (mentorId) =>
  db.select().from(comments).where(eq(comments.mentor_id, mentorId));

const create = async (data) => {
  return await db
    .insert(comments)
    .values(data)
    .returning()
    .then(rows => rows[0]);
};

const update = async (id, data) => {
  const updatable = ['comment', 'line_number'];
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([k]) => updatable.includes(k))
  );

  return await db
    .update(comments)
    .set(updateData)
    .where(eq(comments.id, id))
    .returning()
    .then(rows => rows[0]);
};

const remove = async (id) => {
  return await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning()
    .then(rows => rows[0]);
};

module.exports = {
  findById,
  findAllBySubmissionId,
  findAllByMentorId,
  create,
  update,
  remove,
};
