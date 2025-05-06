const db = require('../config/database');
const { comments } = require('../models');
const { eq } = require('drizzle-orm');

const findById = async (id) =>
  db.select().from(comments).where(eq(comments.id, id)).limit(1).then(r => r[0]);

const findAllBySubmissionId = async (submissionId) =>
  db.select().from(comments).where(eq(comments.submission_id, submissionId));

const findAllByMentorId = async (mentorId) =>
  db.select().from(comments).where(eq(comments.mentor_id, mentorId));

const create = async (data) =>
  db.insert(comments).values(data).returning().then(r => r[0]);

const update = async (id, data) =>
  db.update(comments)
    .set({ ...data })         // ← fixed spread (“.data” ➟ “…data”)
    .where(eq(comments.id, id))
    .returning()
    .then(r => r[0]);

const remove = async (id) =>
  db.delete(comments).where(eq(comments.id, id)).returning().then(r => r[0]);

module.exports = {
  findById,
  findAllBySubmissionId,
  findAllByMentorId,
  create,
  update,
  remove,
};
