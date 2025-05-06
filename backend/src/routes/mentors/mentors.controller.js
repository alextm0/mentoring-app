const { eq, and } = require('drizzle-orm');
const db = require('../../repos/db');
const { users } = require('../../repos/schema/schema');
const { z } = require('zod');

const menteeIdSchema = z.object({
  menteeId: z.string().uuid()
});

async function getMe(req, res) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        mentor_id: users.mentor_id,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function attachMentee(req, res) {
  try {
    const { mentorId } = req.params;
    const validated = menteeIdSchema.parse(req.body);

    // Verify mentor exists and is actually a mentor
    const [mentor] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, mentorId),
        eq(users.role, 'MENTOR')
      ))
      .limit(1);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Verify mentee exists and is actually a mentee
    const [mentee] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, validated.menteeId),
        eq(users.role, 'MENTEE')
      ))
      .limit(1);

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // Check if mentee already has a mentor
    if (mentee.mentor_id) {
      return res.status(400).json({ message: 'Mentee already has a mentor' });
    }

    // Attach mentee to mentor
    const [updatedMentee] = await db
      .update(users)
      .set({ mentor_id: mentorId })
      .where(eq(users.id, validated.menteeId))
      .returning();

    res.json({
      message: 'Mentee attached successfully',
      mentee: {
        id: updatedMentee.id,
        email: updatedMentee.email,
        mentor_id: updatedMentee.mentor_id
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Attach mentee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getMentees(req, res) {
  try {
    const { mentorId } = req.params;

    // Verify mentor exists
    const [mentor] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, mentorId),
        eq(users.role, 'MENTOR')
      ))
      .limit(1);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get all mentees for this mentor
    const mentees = await db
      .select({
        id: users.id,
        email: users.email,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.mentor_id, mentorId));

    res.json(mentees);
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function detachMentee(req, res) {
  try {
    const { mentorId, menteeId } = req.params;

    // Verify mentee belongs to this mentor
    const [mentee] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, menteeId),
        eq(users.mentor_id, mentorId),
        eq(users.role, 'MENTEE')
      ))
      .limit(1);

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee not found or not attached to this mentor' });
    }

    // Detach mentee
    await db
      .update(users)
      .set({ mentor_id: null })
      .where(eq(users.id, menteeId));

    res.json({ message: 'Mentee detached successfully' });
  } catch (error) {
    console.error('Detach mentee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getMe,
  attachMentee,
  getMentees,
  detachMentee
}; 