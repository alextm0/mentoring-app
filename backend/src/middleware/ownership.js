const logger = require('../utils/errorHandler');

const ownership = (req, res, next) => {
  try {
    const { userId, mentorId } = req.params;
    const resourceId = userId || mentorId; // Use the appropriate param based on route
    if (!req.user || req.user.id !== resourceId) {
      return res.status(403).json({ message: 'Ownership verification failed' });
    }
    next();
  } catch (error) {
    logger.error('Ownership check error:', error);
    res.status(403).json({ message: 'Ownership verification failed' });
  }
};

module.exports = ownership;