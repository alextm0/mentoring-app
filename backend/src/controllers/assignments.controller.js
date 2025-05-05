const { eq, and } = require('drizzle-orm');
const db = require('../repos/db');
const { assignments, users } = require('../repos/schema/schema');
const { z } = require('zod');

const assignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
});

async function createAssignment(req, res) {
  try {
    const validated = assignmentSchema.parse(req.body);
    
    const [assignment] = await db.insert(assignments).values({
      mentor_id: req.user.id,
      title: validated.title,
      description: validated.description
    }).returning();

    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getAssignments(req, res) {
  try {
    const assignmentList = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        created_at: assignments.created_at
      })
      .from(assignments)
      .where(eq(assignments.mentor_id, req.user.id));

    res.json(assignmentList);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getMenteeAssignments(req, res) {
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

    // Get assignments from mentor
    const assignmentList = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        created_at: assignments.created_at
      })
      .from(assignments)
      .where(eq(assignments.mentor_id, mentee.mentor_id));

    res.json(assignmentList);
  } catch (error) {
    console.error('Get mentee assignments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const validated = assignmentSchema.parse(req.body);

    // Verify ownership
    const [existing] = await db
      .select()
      .from(assignments)
      .where(and(
        eq(assignments.id, id),
        eq(assignments.mentor_id, req.user.id)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const [updated] = await db
      .update(assignments)
      .set({
        title: validated.title,
        description: validated.description
      })
      .where(eq(assignments.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(assignments)
      .where(and(
        eq(assignments.id, id),
        eq(assignments.mentor_id, req.user.id)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await db
      .delete(assignments)
      .where(eq(assignments.id, id));

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createAssignment,
  getAssignments,
  getMenteeAssignments,
  updateAssignment,
  deleteAssignment
}; 