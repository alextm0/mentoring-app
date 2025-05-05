const { eq } = require('drizzle-orm');
const { z } = require('zod');
const db = require('../repos/db');
const { comments, submissions, assignments } = require('../repos/schema/schema');

// Validation schemas
const createCommentSchema = z.object({
  submission_id: z.string().uuid(),
  line_number: z.number().int().positive(),
  comment: z.string().min(1)
});

async function createComment(req, res) {
  try {
    const result = createCommentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error.issues });
    }

    const { submission_id, line_number, comment } = result.data;

    // Verify submission exists and mentor has access
    const [submission] = await db
      .select({
        id: submissions.id,
        assignment: {
          mentor_id: assignments.mentor_id
        }
      })
      .from(submissions)
      .leftJoin(assignments, eq(submissions.assignment_id, assignments.id))
      .where(eq(submissions.id, submission_id))
      .limit(1);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Only the mentor of the assignment can comment
    if (submission.assignment.mentor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to comment on this submission' });
    }

    // Create the comment
    const [newComment] = await db.insert(comments)
      .values({
        submission_id,
        mentor_id: req.user.id,
        line_number,
        comment
      })
      .returning();

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSubmissionComments(req, res) {
  try {
    const { submissionId } = req.params;

    // Verify submission exists and user has access
    const [submission] = await db
      .select({
        id: submissions.id,
        mentee_id: submissions.mentee_id,
        assignment: {
          mentor_id: assignments.mentor_id
        }
      })
      .from(submissions)
      .leftJoin(assignments, eq(submissions.assignment_id, assignments.id))
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check access - either the mentor of the assignment or the mentee who submitted
    if (submission.assignment.mentor_id !== req.user.id && submission.mentee_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view these comments' });
    }

    // Fetch comments
    const submissionComments = await db
      .select()
      .from(comments)
      .where(eq(comments.submission_id, submissionId))
      .orderBy(comments.line_number, comments.created_at);

    res.json(submissionComments);
  } catch (error) {
    console.error('Get submission comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createComment,
  getSubmissionComments
}; 