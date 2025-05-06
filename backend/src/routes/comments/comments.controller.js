const { z } = require('zod');
const {
  commentsRepo,
  submissionsRepo,
  assignmentsRepo,          // ← pull in assignments to check mentor‑ownership
} = require('../../repos');
const logger = require('../../utils/logger');

const createCommentSchema = z.object({
  submission_id: z.string().uuid(),
  line_number:   z.number().int().positive(),
  comment:       z.string().min(1),
});

async function createComment(req, res, next) {
  try {
    const v = createCommentSchema.parse(req.body);

    // 1️⃣ make sure the submission exists
    const submission = await submissionsRepo.findById(v.submission_id);
    if (!submission) {
      return next({ status: 404, message: 'Submission not found' });
    }

    // 2️⃣ load the assignment to verify the mentor
    const assignment = await assignmentsRepo.findById(submission.assignment_id);
    if (!assignment) {
      return next({ status: 404, message: 'Assignment not found' });
    }
    if (assignment.mentor_id !== req.user.id) {
      return next({ status: 403, message: 'Not authorized to comment on this submission' });
    }

    // 3️⃣ create the comment
    const newComment = await commentsRepo.create({
      submission_id: v.submission_id,
      mentor_id:     req.user.id,
      line_number:   v.line_number,
      comment:       v.comment,
    });

    return res.status(201).json(newComment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: err.errors });
    }
    logger.error('Create comment error:', err);
    next(err);
  }
}

async function getSubmissionComments(req, res, next) {
  try {
    const { submissionId } = req.params;

    const submission = await submissionsRepo.findById(submissionId);
    if (!submission) {
      return next({ status: 404, message: 'Submission not found' });
    }

    const assignment = await assignmentsRepo.findById(submission.assignment_id);
    if (!assignment) {
      return next({ status: 404, message: 'Assignment not found' });
    }

    // mentor of the assignment OR mentee who submitted may view
    const isMentor = assignment.mentor_id === req.user.id;
    const isMentee = submission.mentee_id === req.user.id;

    if (!isMentor && !isMentee) {
      return next({ status: 403, message: 'Not authorized to view these comments' });
    }

    const list = await commentsRepo.findAllBySubmissionId(submissionId);
    return res.json(list);
  } catch (err) {
    logger.error('Get submission comments error:', err);
    next(err);
  }
}

module.exports = {
  createComment,
  getSubmissionComments,
};
