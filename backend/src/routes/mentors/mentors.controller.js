const { usersRepo } = require('../../repos');
const errorHandler = require('../../utils/errorHandler');
const logger = require('../../utils/logger');
const { z } = require('zod');

const menteeIdSchema = z.object({
  menteeId: z.string().uuid(),
});

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

async function attachMentee(req, res, next) {
  try {
    const { mentorId } = req.params;
    const validated = menteeIdSchema.parse(req.body);

    const mentor = await usersRepo.findById(mentorId);
    if (!mentor || mentor.role !== 'MENTOR') {
      return next({ status: 404, message: 'Mentor not found' });
    }

    const mentee = await usersRepo.findById(validated.menteeId);
    if (!mentee || mentee.role !== 'MENTEE') {
      return next({ status: 404, message: 'Mentee not found' });
    }

    if (mentee.mentor_id) {
      return next({ status: 400, message: 'Mentee already has a mentor' });
    }

    const updatedMentee = await usersRepo.update(validated.menteeId, { mentor_id: mentorId });
    res.json({
      message: 'Mentee attached successfully',
      mentee: {
        id: updatedMentee.id,
        email: updatedMentee.email,
        mentor_id: updatedMentee.mentor_id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Attach mentee error:', error);
    next(error);
  }
}

async function getMentees(req, res, next) {
  try {
    const { mentorId } = req.params;

    const mentor = await usersRepo.findById(mentorId);
    if (!mentor || mentor.role !== 'MENTOR') {
      return next({ status: 404, message: 'Mentor not found' });
    }

    const mentees = await usersRepo.findMenteesByMentorId(mentorId);
    res.json(mentees.map(mentee => ({
      id: mentee.id,
      email: mentee.email,
      created_at: mentee.created_at,
    })));
  } catch (error) {
    logger.error('Get mentees error:', error);
    next(error);
  }
}

async function detachMentee(req, res, next) {
  try {
    const { mentorId, menteeId } = req.params;

    const mentee = await usersRepo.findById(menteeId);
    if (!mentee || mentee.role !== 'MENTEE' || mentee.mentor_id !== mentorId) {
      return next({ status: 404, message: 'Mentee not found or not attached to this mentor' });
    }

    await usersRepo.update(menteeId, { mentor_id: null });
    res.json({ message: 'Mentee detached successfully' });
  } catch (error) {
    logger.error('Detach mentee error:', error);
    next(error);
  }
}

module.exports = {
  getMe,
  attachMentee,
  getMentees,
  detachMentee,
};