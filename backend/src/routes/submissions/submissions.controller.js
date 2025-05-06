const { z } = require('zod');
const { submissionsRepo, assignmentsRepo } = require('../../repos');
const logger = require('../../utils/logger');

const submissionSchema = z.object({
  assignment_id: z.string().uuid(),
  snippet: z.string().min(1),
});

const toggleCompletedSchema = z.object({
  completed: z.boolean(),
});

async function createSubmission(req, res, next) {
  try {
    const validated = submissionSchema.parse(req.body);

    const assignment = await assignmentsRepo.findById(validated.assignment_id);
    if (!assignment) {
      return next({ status: 404, message: 'Assignment not found' });
    }

    const submission = await submissionsRepo.create({
      assignment_id: validated.assignment_id,
      mentee_id: req.user.id,
      snippet: validated.snippet,
      completed: false,
    });

    res.status(201).json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Create submission error:', error);
    next(error);
  }
}

async function getMenteeSubmissions(req, res, next) {
  try {
    const submissionList = await submissionsRepo.findAllByMenteeId(req.user.id);
    res.json(submissionList.map(submission => ({
      id: submission.id,
      assignment_id: submission.assignment_id,
      snippet: submission.snippet,
      completed: submission.completed,
      created_at: submission.created_at,
    })));
  } catch (error) {
    logger.error('Get mentee submissions error:', error);
    next(error);
  }
}

async function getAssignmentSubmissions(req, res, next) {
  try {
    const { assignmentId } = req.params;

    const assignment = await assignmentsRepo.findById(assignmentId);
    if (!assignment || assignment.mentor_id !== req.user.id) {
      return next({ status: 403, message: 'Access denied' });
    }

    const submissionList = await submissionsRepo.findAllByAssignmentId(assignmentId);
    res.json(submissionList.map(submission => ({
      id: submission.id,
      mentee_id: submission.mentee_id,
      snippet: submission.snippet,
      completed: submission.completed,
      created_at: submission.created_at,
    })));
  } catch (error) {
    logger.error('Get assignment submissions error:', error);
    next(error);
  }
}

async function toggleCompleted(req, res, next) {
  try {
    const { id } = req.params;
    const validated = toggleCompletedSchema.parse(req.body);

    const submission = await submissionsRepo.findById(id);
    if (!submission) {
      return next({ status: 404, message: 'Submission not found' });
    }

    const assignment = await assignmentsRepo.findById(submission.assignment_id);
    if (!assignment || assignment.mentor_id !== req.user.id) {
      return next({ status: 403, message: 'Access denied' });
    }

    const updated = await submissionsRepo.update(id, { completed: validated.completed });
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Toggle completion error:', error);
    next(error);
  }
}

module.exports = {
  createSubmission,
  getMenteeSubmissions,
  getAssignmentSubmissions,
  toggleCompleted,
};