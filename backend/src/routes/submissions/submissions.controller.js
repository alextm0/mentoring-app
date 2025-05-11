const { z } = require('zod');
const { submissionsRepo, assignmentsRepo, usersRepo } = require('../../repos');
const logger = require('../../utils/logger');
const { logUserAction, ACTIONS, ENTITIES } = require('../../utils/auditLogger');

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

    // Log the create action
    logUserAction(
      req,
      ACTIONS.CREATE,
      ENTITIES.SUBMISSION,
      submission.id,
      `Created submission for assignment: ${validated.assignment_id}`
    );

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
    
    // Log the read action
    logUserAction(
      req,
      ACTIONS.READ,
      ENTITIES.SUBMISSION,
      req.user.id, // Using user ID as entity ID since we're fetching multiple submissions
      `Retrieved ${submissionList.length} mentee submissions`
    );
    
    // Include all properties, including the assignment_title from the join
    res.json(submissionList);
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
    
    // Log the read action
    logUserAction(
      req,
      ACTIONS.READ,
      ENTITIES.SUBMISSION,
      assignmentId, // Using assignment ID since we're fetching submissions for an assignment
      `Retrieved ${submissionList.length} submissions for assignment: ${assignmentId}`
    );
    
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

    // Only mentors can mark submissions as complete
    if (req.user.role !== 'MENTOR') {
      return next({ status: 403, message: 'Only mentors can mark submissions as complete' });
    }
    
    // Mentors can only mark submissions for assignments they created
    const assignment = await assignmentsRepo.findById(submission.assignment_id);
    if (!assignment || assignment.mentor_id !== req.user.id) {
      return next({ status: 403, message: 'Access denied' });
    }

    const updated = await submissionsRepo.update(id, { completed: validated.completed });
    
    // Log the update action
    logUserAction(
      req,
      ACTIONS.UPDATE,
      ENTITIES.SUBMISSION,
      id,
      `Updated submission status to ${validated.completed ? 'completed' : 'incomplete'}`
    );
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Toggle completion error:', error);
    next(error);
  }
}

async function getAllMenteeSubmissions(req, res, next) {
  try {
    // Only mentors can access this endpoint
    if (req.user.role !== 'MENTOR') {
      return next({ status: 403, message: 'Access denied' });
    }

    const submissionList = await submissionsRepo.findAllByMentorId(req.user.id);
    
    // Log the read action
    logUserAction(
      req,
      ACTIONS.READ,
      ENTITIES.SUBMISSION,
      req.user.id, // Using mentor ID since we're fetching all mentee submissions for this mentor
      `Retrieved ${submissionList.length} submissions from all mentees`
    );
    
    res.json(submissionList.map(submission => ({
      id: submission.id,
      assignment_id: submission.assignment_id,
      mentee_id: submission.mentee_id,
      snippet: submission.snippet,
      completed: submission.completed,
      created_at: submission.created_at,
    })));
  } catch (error) {
    logger.error('Get all mentee submissions error:', error);
    next(error);
  }
}

async function getSubmissionById(req, res, next) {
  try {
    const { id } = req.params;
    
    const submission = await submissionsRepo.findById(id);
    if (!submission) {
      return next({ status: 404, message: 'Submission not found' });
    }
    
    // Check authorization: mentors can view submissions only for assignments they created
    // mentees can only view their own submissions
    if (req.user.role === 'MENTEE') {
      if (submission.mentee_id !== req.user.id) {
        return next({ status: 403, message: 'Access denied' });
      }
    } else if (req.user.role === 'MENTOR') {
      const assignment = await assignmentsRepo.findById(submission.assignment_id);
      if (!assignment || assignment.mentor_id !== req.user.id) {
        return next({ status: 403, message: 'Access denied' });
      }
    }
    
    // Log the read action
    logUserAction(
      req,
      ACTIONS.READ,
      ENTITIES.SUBMISSION,
      id,
      `Retrieved submission details`
    );
    
    res.json(submission);
  } catch (error) {
    logger.error('Get submission by ID error:', error);
    next(error);
  }
}

async function updateSubmission(req, res, next) {
  try {
    const { id } = req.params;
    const validated = submissionSchema.parse(req.body);
    
    const submission = await submissionsRepo.findById(id);
    if (!submission) {
      return next({ status: 404, message: 'Submission not found' });
    }
    
    // Only mentees can update their own submissions and only if they're not completed
    if (req.user.role !== 'MENTEE' || submission.mentee_id !== req.user.id) {
      return next({ status: 403, message: 'Access denied' });
    }
    
    if (submission.completed) {
      return next({ status: 400, message: 'Cannot update a completed submission' });
    }
    
    // Only allow updating the snippet, not assignment_id
    const updatedSubmission = await submissionsRepo.update(id, { 
      snippet: validated.snippet 
    });
    
    // Log the update action
    logUserAction(
      req,
      ACTIONS.UPDATE,
      ENTITIES.SUBMISSION,
      id,
      `Updated submission content`
    );
    
    res.json(updatedSubmission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Update submission error:', error);
    next(error);
  }
}

async function deleteSubmission(req, res, next) {
  try {
    const { id } = req.params;
    
    const submission = await submissionsRepo.findById(id);
    if (!submission) {
      return next({ status: 404, message: 'Submission not found' });
    }
    
    // Only mentees can delete their own submissions
    if (req.user.role === 'MENTEE') {
      if (submission.mentee_id !== req.user.id) {
        return next({ status: 403, message: 'Access denied' });
      }
    } else if (req.user.role === 'MENTOR') {
      // Mentors can only delete submissions for assignments they created
      const assignment = await assignmentsRepo.findById(submission.assignment_id);
      if (!assignment || assignment.mentor_id !== req.user.id) {
        return next({ status: 403, message: 'Access denied' });
      }
    }
    
    await submissionsRepo.remove(id);
    
    // Log the delete action
    logUserAction(
      req,
      ACTIONS.DELETE,
      ENTITIES.SUBMISSION,
      id,
      `Deleted submission`
    );
    
    res.status(204).end();
  } catch (error) {
    logger.error('Delete submission error:', error);
    next(error);
  }
}

async function getSubmissionWithComments(req, res, next) {
  try {
    const { id } = req.params;
    
    const submission = await submissionsRepo.findWithComments(id);
    if (!submission) {
      return next({ status: 404, message: 'Submission not found' });
    }
    
    // Check authorization: mentors can view submissions only for assignments they created
    // mentees can only view their own submissions
    if (req.user.role === 'MENTEE') {
      if (submission.mentee_id !== req.user.id) {
        return next({ status: 403, message: 'Access denied' });
      }
    } else if (req.user.role === 'MENTOR') {
      const assignment = await assignmentsRepo.findById(submission.assignment_id);
      if (!assignment || assignment.mentor_id !== req.user.id) {
        return next({ status: 403, message: 'Access denied' });
      }
    }
    
    // Log the read action
    logUserAction(
      req,
      ACTIONS.READ,
      ENTITIES.SUBMISSION,
      id,
      `Retrieved submission with comments`
    );
    
    res.json(submission);
  } catch (error) {
    logger.error('Get submission with comments error:', error);
    next(error);
  }
}

async function getMenteeSubmissionForAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;
    
    // Check if the assignment exists
    const assignment = await assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      return next({ status: 404, message: 'Assignment not found' });
    }

    // For mentees, check if this assignment is from their mentor
    if (req.user.role === 'MENTEE') {
      const user = await usersRepo.findById(req.user.id);
      if (!user?.mentor_id || assignment.mentor_id !== user.mentor_id) {
        return next({ status: 403, message: 'This assignment is not assigned to you' });
      }
    }
    
    // Get the specific submission
    const submission = await submissionsRepo.findByAssignmentAndMenteeId(assignmentId, req.user.id);
    
    // Log the read action
    logUserAction(
      req,
      ACTIONS.READ,
      ENTITIES.SUBMISSION,
      req.user.id,
      `Retrieved own submission for assignment: ${assignmentId}`
    );
    
    // Include the assignment title in the response
    const result = submission ? {
      ...submission,
      assignment_title: assignment.title
    } : null;
    
    res.json(result);
  } catch (error) {
    logger.error('Get mentee submission for assignment error:', error);
    next(error);
  }
}

module.exports = {
  createSubmission,
  getMenteeSubmissions,
  getAssignmentSubmissions,
  toggleCompleted,
  getAllMenteeSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getSubmissionWithComments,
  getMenteeSubmissionForAssignment,
};