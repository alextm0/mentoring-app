const db = require('../config/database');
const { submissions, users, assignments, comments } = require('../models');
const { eq, and } = require('drizzle-orm');

const findById = async (id) => {
  return await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)
    .execute()
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
    .where(eq(submissions.assignment_id, assignmentId))
    .execute();
};

const findAllByMentorId = async (mentorId) => {
  return await db
    .select({
      ...submissions,
      mentee_name: users.email,
      assignment_title: assignments.title,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.mentee_id, users.id))
    .innerJoin(assignments, eq(submissions.assignment_id, assignments.id))
    .where(eq(assignments.mentor_id, mentorId))
    .execute();
};

const findAllByMenteeId = async (menteeId) => {
  return await db
    .select({
      ...submissions,
      assignment_title: assignments.title,
    })
    .from(submissions)
    .innerJoin(assignments, eq(submissions.assignment_id, assignments.id))
    .where(eq(submissions.mentee_id, menteeId))
    .execute();
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
    .execute()
    .then(rows => rows[0]);
};

const findWithComments = async (id) => {
  const submission = await findById(id);
  
  if (!submission) return null;
  
  const submissionComments = await db
    .select()
    .from(comments)
    .where(eq(comments.submission_id, id))
    .execute();
  
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
  findAllByMentorId,
  findWithComments,
  create,
  update,
  remove,
};