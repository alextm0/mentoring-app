const { usersRepo } = require('../repos');
const errorHandler = require('../utils/errorHandler');
const logger = require('../utils/logger');

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
      created_at: user.created_at,
    });
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
}

async function getMentorDetails(req, res, next) {
  try {
    const mentee = await usersRepo.findById(req.user.id);
    if (!mentee) {
      return next({ status: 404, message: 'User not found' });
    }
    if (!mentee.mentor_id) {
      return next({ status: 404, message: 'No mentor assigned' });
    }

    const mentor = await usersRepo.findById(mentee.mentor_id);
    if (!mentor || mentor.role !== 'MENTOR') {
      return next({ status: 404, message: 'Mentor not found' });
    }

    res.json({
      id: mentor.id,
      email: mentor.email,
      role: mentor.role,
      created_at: mentor.created_at,
    });
  } catch (error) {
    logger.error('Get mentor details error:', error);
    next(error);
  }
}

module.exports = {
  getMe,
  getMentorDetails,
};