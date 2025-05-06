const { z } = require('zod');
const { assignmentsRepo } = require('../../repos');
const { usersRepo }      = require('../../repos'); // ← import usersRepo
const errorHandler       = require('../../utils/errorHandler');

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
    res.json(assignmentList);
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

    await assignmentsRepo.remove(id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAssignment,
  getAssignments,
  getMenteeAssignments,
  updateAssignment,
  deleteAssignment,
};
