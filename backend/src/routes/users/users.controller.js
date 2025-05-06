const { usersRepo } = require('../../repos');
const logger = require('../../utils/logger');

async function getMe(req, res, next) {
  try {
    const user = await usersRepo.findById(req.user.id);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      mentor_id: user.mentor_id,
    });
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
}

async function getMentees(req, res, next) {
  try {
    if (req.user.role !== 'MENTOR') {
      return next({ status: 403, message: 'Only mentors can view mentees' });
    }

    const mentees = await usersRepo.findMenteesByMentorId(req.user.id);
    res.json(mentees.map(mentee => ({
      id: mentee.id,
      email: mentee.email,
    })));
  } catch (error) {
    logger.error('Get mentees error:', error);
    next(error);
  }
}

async function getMentor(req, res, next) {
  try {
    if (req.user.role !== 'MENTEE') {
      return next({ status: 403, message: 'Only mentees can view their mentor' });
    }

    const user = await usersRepo.findById(req.user.id);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }
    if (!user.mentor_id) {
      return next({ status: 404, message: 'No mentor assigned' });
    }

    const mentor = await usersRepo.findById(user.mentor_id);
    if (!mentor || mentor.role !== 'MENTOR') {
      return next({ status: 404, message: 'Mentor not found' });
    }

    res.json({
      id: mentor.id,
      email: mentor.email,
    });
  } catch (error) {
    logger.error('Get mentor error:', error);
    next(error);
  }
}

module.exports = {
  getMe,
  getMentees,
  getMentor,
};