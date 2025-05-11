const db = require('../config/database');
const { submissions, users, assignments, comments } = require('../models');
const { eq, and } = require('drizzle-orm');

const findById = async (id) => {
  return await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)
    .then(rows => rows[0]);
};

const findAllByAssignmentId = async (assignmentId) => {
  return await db
    .select({
      ...submissions,
      mentee_name: users.email, // Using email as name for now
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.mentee_id, users.id))
    .where(eq(submissions.assignment_id, assignmentId));
};

const findAllByMenteeId = async (menteeId) => {
  return await db
    .select({
      ...submissions,
      assignment_title: assignments.title,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignment_id, assignments.id))
    .where(eq(submissions.mentee_id, menteeId));
};

const findByAssignmentAndMenteeId = async (assignmentId, menteeId) => {
  return await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.assignment_id, assignmentId),
        eq(submissions.mentee_id, menteeId)
      )
    )
    .limit(1)
    .then(rows => rows[0]);
};

const findWithComments = async (id) => {
  const submission = await findById(id);
  
  if (!submission) return null;
  
  const submissionComments = await db
    .select()
    .from(comments)
    .where(eq(comments.submission_id, id));
  
  return {
    ...submission,
    comments: submissionComments || []
  };
};

const create = async (data) => {
  return await db
    .insert(submissions)
    .values(data)
    .returning()
    .then(rows => rows[0]);
};

const update = async (id, data) => {
  const updatable = ['snippet', 'completed'];
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([k]) => updatable.includes(k))
  );

  return await db
    .update(submissions)
    .set(updateData)
    .where(eq(submissions.id, id))
    .returning()
    .then(rows => rows[0]);
};

const remove = async (id) => {
  return await db
    .delete(submissions)
    .where(eq(submissions.id, id))
    .returning()
    .then(rows => rows[0]);
};

module.exports = {
  findById,
  findAllByAssignmentId,
  findAllByMenteeId,
  findByAssignmentAndMenteeId,
  findWithComments,
  create,
  update,
  remove,
};