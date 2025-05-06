const { z } = require('zod');
const { resourcesRepo, assignmentsRepo, usersRepo } = require('../../repos');
const logger = require('../../utils/logger');

const resourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  assignment_id: z.string().uuid().optional(),
});

async function createResource(req, res, next) {
  try {
    const validated = resourceSchema.parse(req.body);

    if (validated.assignment_id) {
      const assignment = await assignmentsRepo.findById(validated.assignment_id);
      if (!assignment || assignment.mentor_id !== req.user.id) {
        return next({ status: 404, message: 'Assignment not found or unauthorized' });
      }
    }

    const resource = await resourcesRepo.create({
      mentor_id: req.user.id,
      title: validated.title,
      url: validated.url,
      assignment_id: validated.assignment_id,
    });

    res.status(201).json(resource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Create resource error:', error);
    next(error);
  }
}

async function getResources(req, res, next) {
  try {
    const { assignment_id } = req.query;
    let resources;
    if (assignment_id) {
      resources = await resourcesRepo.findAllByAssignmentId(assignment_id);
      const assignment = await assignmentsRepo.findById(assignment_id);
      if (!assignment || assignment.mentor_id !== req.user.id) {
        return next({ status: 403, message: 'Access denied to this assignment' });
      }
    } else {
      resources = await resourcesRepo.findAllByMentorId(req.user.id);
    }
    res.json(resources);
  } catch (error) {
    logger.error('Get resources error:', error);
    next(error);
  }
}

async function getMenteeResources(req, res, next) {
  try {
    const mentee = await usersRepo.findById(req.user.id);
    if (!mentee || !mentee.mentor_id) {
      return next({ status: 404, message: 'No mentor assigned' });
    }

    const { assignment_id } = req.query;
    let resources = await resourcesRepo.findAllByMentorId(mentee.mentor_id);

    if (assignment_id) {
      resources = resources.filter(resource =>
        resource.assignment_id === assignment_id || !resource.assignment_id
      );
    }

    res.json(resources);
  } catch (error) {
    logger.error('Get mentee resources error:', error);
    next(error);
  }
}

async function getResourceById(req, res, next) {
  try {
    const { id } = req.params;
    const resource = await resourcesRepo.findById(id);
    if (!resource) {
      return next({ status: 404, message: 'Resource not found' });
    }

    if (req.user.role === 'MENTEE') {
      const mentee = await usersRepo.findById(req.user.id);
      if (!mentee.mentor_id || resource.mentor_id !== mentee.mentor_id) {
        return next({ status: 403, message: 'Access denied' });
      }
    } else if (resource.mentor_id !== req.user.id) {
      return next({ status: 403, message: 'Access denied' });
    }

    res.json(resource);
  } catch (error) {
    logger.error('Get resource error:', error);
    next(error);
  }
}

async function updateResource(req, res, next) {
  try {
    const { id } = req.params;
    const validated = resourceSchema.parse(req.body);

    const existing = await resourcesRepo.findById(id);
    if (!existing || existing.mentor_id !== req.user.id) {
      return next({ status: 404, message: 'Resource not found or unauthorized' });
    }

    if (validated.assignment_id) {
      const assignment = await assignmentsRepo.findById(validated.assignment_id);
      if (!assignment || assignment.mentor_id !== req.user.id) {
        return next({ status: 404, message: 'Assignment not found or unauthorized' });
      }
    }

    const updated = await resourcesRepo.update(id, {
      title: validated.title,
      url: validated.url,
      assignment_id: validated.assignment_id,
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Update resource error:', error);
    next(error);
  }
}

async function deleteResource(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await resourcesRepo.findById(id);
    if (!existing || existing.mentor_id !== req.user.id) {
      return next({ status: 404, message: 'Resource not found or unauthorized' });
    }

    await resourcesRepo.remove(id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    logger.error('Delete resource error:', error);
    next(error);
  }
}

module.exports = {
  createResource,
  getResources,
  getMenteeResources,
  getResourceById,
  updateResource,
  deleteResource,
};