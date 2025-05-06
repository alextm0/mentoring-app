const { eq, and, isNull, or } = require('drizzle-orm');
const db = require('../../repos/db');
const { resources, users, assignments } = require('../../repos/schema/schema');
const { z } = require('zod');

const resourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  assignment_id: z.string().uuid().optional()
});

async function createResource(req, res) {
  try {
    const validated = resourceSchema.parse(req.body);
    
    // If assignment_id is provided, verify it exists and belongs to mentor
    if (validated.assignment_id) {
      const [assignment] = await db
        .select()
        .from(assignments)
        .where(and(
          eq(assignments.id, validated.assignment_id),
          eq(assignments.mentor_id, req.user.id)
        ))
        .limit(1);

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
    }

    const [resource] = await db.insert(resources).values({
      mentor_id: req.user.id,
      title: validated.title,
      url: validated.url,
      assignment_id: validated.assignment_id
    }).returning();

    res.status(201).json(resource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getResources(req, res) {
  try {
    const { assignment_id } = req.query;
    let query = db
      .select()
      .from(resources)
      .where(eq(resources.mentor_id, req.user.id));

    if (assignment_id) {
      query = query.where(eq(resources.assignment_id, assignment_id));
    }

    const resourceList = await query;
    res.json(resourceList);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getMenteeResources(req, res) {
  try {
    // Get mentee's mentor_id
    const [mentee] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!mentee.mentor_id) {
      return res.status(404).json({ message: 'No mentor assigned' });
    }

    const { assignment_id } = req.query;
    let query = db
      .select()
      .from(resources)
      .where(eq(resources.mentor_id, mentee.mentor_id));

    if (assignment_id) {
      query = query.where(or(
        eq(resources.assignment_id, assignment_id),
        isNull(resources.assignment_id)
      ));
    }

    const resourceList = await query;
    res.json(resourceList);
  } catch (error) {
    console.error('Get mentee resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getResourceById(req, res) {
  try {
    const { id } = req.params;
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // If user is mentee, verify the resource belongs to their mentor
    if (req.user.role === 'MENTEE') {
      const [mentee] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!mentee.mentor_id || resource.mentor_id !== mentee.mentor_id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    // If user is mentor, verify ownership
    else if (resource.mentor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateResource(req, res) {
  try {
    const { id } = req.params;
    const validated = resourceSchema.parse(req.body);

    // Verify ownership
    const [existing] = await db
      .select()
      .from(resources)
      .where(and(
        eq(resources.id, id),
        eq(resources.mentor_id, req.user.id)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // If assignment_id is provided, verify it exists and belongs to mentor
    if (validated.assignment_id) {
      const [assignment] = await db
        .select()
        .from(assignments)
        .where(and(
          eq(assignments.id, validated.assignment_id),
          eq(assignments.mentor_id, req.user.id)
        ))
        .limit(1);

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
    }

    const [updated] = await db
      .update(resources)
      .set({
        title: validated.title,
        url: validated.url,
        assignment_id: validated.assignment_id
      })
      .where(eq(resources.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteResource(req, res) {
  try {
    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(resources)
      .where(and(
        eq(resources.id, id),
        eq(resources.mentor_id, req.user.id)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await db
      .delete(resources)
      .where(eq(resources.id, id));

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createResource,
  getResources,
  getMenteeResources,
  getResourceById,
  updateResource,
  deleteResource
}; 