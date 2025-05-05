const { eq } = require('drizzle-orm');
const db = require('../repos/db');
const { users } = require('../repos/schema/schema');

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

async function getMentees(req, res) {
  try {
    if (req.user.role !== 'MENTOR') {
      return res.status(403).json({ message: 'Only mentors can view mentees' });
    }

    const mentees = await db
      .select({
        id: users.id,
        email: users.email,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.mentor_id, req.user.id));

    res.json(mentees);
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getMentor(req, res) {
  try {
    if (req.user.role !== 'MENTEE') {
      return res.status(403).json({ message: 'Only mentees can view their mentor' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user.mentor_id) {
      return res.status(404).json({ message: 'No mentor assigned' });
    }

    const [mentor] = await db
      .select({
        id: users.id,
        email: users.email,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.id, user.mentor_id))
      .limit(1);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.json(mentor);
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getMe,
  getMentees,
  getMentor
}; 