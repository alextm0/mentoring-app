const { eq, and } = require('drizzle-orm');
const { z } = require('zod');
const db = require('../../repos/db');
const { submissions, assignments } = require('../../repos/schema/schema');

const submissionSchema = z.object({
  assignment_id: z.string().uuid(),
  snippet: z.string().min(1)
});

const toggleCompletedSchema = z.object({
  completed: z.boolean()
});

async function createSubmission(req, res) {
  try {
    const result = submissionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error.issues });
    }

    const { assignment_id, snippet } = result.data;

    // Verify assignment exists
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignment_id))
      .limit(1);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Create submission
    const [submission] = await db.insert(submissions)
      .values({
        assignment_id,
        mentee_id: req.user.id,
        snippet,
        completed: false
      })
      .returning();

    res.status(201).json(submission);
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMenteeSubmissions(req, res) {
  try {
    const submissionList = await db
      .select({
        id: submissions.id,
        assignment_id: submissions.assignment_id,
        snippet: submissions.snippet,
        completed: submissions.completed,
        created_at: submissions.created_at
      })
      .from(submissions)
      .where(eq(submissions.mentee_id, req.user.id));

    res.json(submissionList);
  } catch (error) {
    console.error('Get mentee submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAssignmentSubmissions(req, res) {
  try {
    const { assignmentId } = req.params;

    // Verify mentor owns the assignment
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(and(
        eq(assignments.id, assignmentId),
        eq(assignments.mentor_id, req.user.id)
      ))
      .limit(1);

    if (!assignment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const submissionList = await db
      .select({
        id: submissions.id,
        mentee_id: submissions.mentee_id,
        snippet: submissions.snippet,
        completed: submissions.completed,
        created_at: submissions.created_at
      })
      .from(submissions)
      .where(eq(submissions.assignment_id, assignmentId));

    res.json(submissionList);
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function toggleCompleted(req, res) {
  try {
    const { id } = req.params;
    const result = toggleCompletedSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error.issues });
    }

    // Get submission and verify mentor owns the assignment
    const [submission] = await db
      .select({
        id: submissions.id,
        assignment: {
          mentor_id: assignments.mentor_id
        }
      })
      .from(submissions)
      .leftJoin(assignments, eq(submissions.assignment_id, assignments.id))
      .where(eq(submissions.id, id))
      .limit(1);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.assignment.mentor_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update completion status
    const [updated] = await db
      .update(submissions)
      .set({ completed: result.data.completed })
      .where(eq(submissions.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Toggle completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createSubmission,
  getMenteeSubmissions,
  getAssignmentSubmissions,
  toggleCompleted
}; 