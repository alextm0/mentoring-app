const { z } = require('zod');
const { assignmentsRepo } = require('../../repos');
const { usersRepo }      = require('../../repos'); // ← import usersRepo
const errorHandler       = require('../../utils/errorHandler');
const { logUserAction, ACTIONS, ENTITIES } = require('../../utils/auditLogger');

const assignmentSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
});

async function createAssignment(req, res, next) {
  try {
    const validated = assignmentSchema.parse(req.body);
    const assignment = await assignmentsRepo.create({
      mentor_id:  req.user.id,
      title:      validated.title,
      description: validated.description,
    });
    
    // Log the creation action
    logUserAction(
      req, 
      ACTIONS.CREATE, 
      ENTITIES.ASSIGNMENT, 
      assignment.id, 
      `Created assignment: ${assignment.title}`
    );
    
    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
}

async function getAssignments(req, res, next) {
  try {
    const assignmentList = await assignmentsRepo.findAllByMentorId(req.user.id);
    
    // Log the read action
    logUserAction(
      req, 
      ACTIONS.READ, 
      ENTITIES.ASSIGNMENT, 
      req.user.id, // Using user ID as entity ID since we're fetching multiple assignments
      `Retrieved ${assignmentList.length} assignments`
    );
    
    res.json(assignmentList);
  } catch (error) {
    next(error);
  }
}

async function getAssignmentById(req, res, next) {
  try {
    const { id } = req.params;
    const assignment = await assignmentsRepo.findById(id);
    
    if (!assignment) {
      return next({ status: 404, message: 'Assignment not found' });
    }
    
    // Authorization check based on role
    if (req.user.role === 'MENTOR') {
      // Mentors can only view their own assignments
      if (assignment.mentor_id !== req.user.id) {
        return next({ status: 403, message: 'Unauthorized to view this assignment' });
      }
    } else if (req.user.role === 'MENTEE') {
      // Mentees can only view assignments from their assigned mentor
      const user = await usersRepo.findById(req.user.id);
      if (!user?.mentor_id || assignment.mentor_id !== user.mentor_id) {
        return next({ status: 403, message: 'This assignment is not assigned to you' });
      }
    }
    
    // Log the read action
    logUserAction(
      req, 
      ACTIONS.READ, 
      ENTITIES.ASSIGNMENT, 
      id,
      `Retrieved assignment: ${assignment.title}`
    );
    
    res.json(assignment);
  } catch (error) {
    next(error);
  }
}

async function getMenteeAssignments(req, res, next) {
  try {
    const user = await usersRepo.findById(req.user.id);
    if (!user?.mentor_id) {
      return next({ status: 404, message: 'No mentor assigned' });
    }
    const assignmentList = await assignmentsRepo.findAllByMentorId(user.mentor_id);
    
    // Log the read action
    logUserAction(
      req, 
      ACTIONS.READ, 
      ENTITIES.ASSIGNMENT, 
      req.user.id,
      `Retrieved ${assignmentList.length} mentee assignments`
    );
    
    res.json(assignmentList);
  } catch (error) {
    next(error);
  }
}

async function updateAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const validated = assignmentSchema.parse(req.body);

    const existing = await assignmentsRepo.findById(id);
    if (!existing || existing.mentor_id !== req.user.id) {
      return next({ status: 404, message: 'Assignment not found or unauthorized' });
    }

    const updated = await assignmentsRepo.update(id, {
      title:      validated.title,
      description: validated.description,
    });
    
    // Log the update action
    logUserAction(
      req, 
      ACTIONS.UPDATE, 
      ENTITIES.ASSIGNMENT, 
      id,
      `Updated assignment: ${updated.title}`
    );
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
}

async function deleteAssignment(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await assignmentsRepo.findById(id);
    if (!existing || existing.mentor_id !== req.user.id) {
      return next({ status: 404, message: 'Assignment not found or unauthorized' });
    }
    
    // Log the delete action before actually deleting
    logUserAction(
      req, 
      ACTIONS.DELETE, 
      ENTITIES.ASSIGNMENT, 
      id,
      `Deleted assignment: ${existing.title}`
    );

    await assignmentsRepo.remove(id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getMenteeAssignments,
  updateAssignment,
  deleteAssignment,
};
