const { logsRepo } = require('../../repos');
const logger = require('../../utils/logger');

/**
 * Get all logs with pagination
 */
async function getLogs(req, res, next) {
  try {
    // Only allow admins to access logs
    if (req.user.role !== 'ADMIN') {
      return next({ status: 403, message: 'Access denied' });
    }

    const { page = 1, limit = 100 } = req.query;
    const logsList = await logsRepo.findAll(parseInt(page), parseInt(limit));
    
    res.json(logsList);
  } catch (error) {
    logger.error('Get logs error:', error);
    next(error);
  }
}

/**
 * Get logs for a specific user
 */
async function getUserLogs(req, res, next) {
  try {
    // Only allow admins to access logs
    if (req.user.role !== 'ADMIN') {
      return next({ status: 403, message: 'Access denied' });
    }

    const { userId } = req.params;
    const { limit = 100 } = req.query;
    
    const logsList = await logsRepo.findByUserId(userId, parseInt(limit));
    res.json(logsList);
  } catch (error) {
    logger.error('Get user logs error:', error);
    next(error);
  }
}

/**
 * Get logs for a specific entity type and ID
 */
async function getEntityLogs(req, res, next) {
  try {
    // Only allow admins to access logs
    if (req.user.role !== 'ADMIN') {
      return next({ status: 403, message: 'Access denied' });
    }

    const { entityType, entityId } = req.params;
    const { limit = 100 } = req.query;
    
    const logsList = await logsRepo.findByEntity(entityType, entityId, parseInt(limit));
    res.json(logsList);
  } catch (error) {
    logger.error('Get entity logs error:', error);
    next(error);
  }
}

/**
 * Get logs within a date range
 */
async function getLogsByDateRange(req, res, next) {
  try {
    // Only allow admins to access logs
    if (req.user.role !== 'ADMIN') {
      return next({ status: 403, message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const { limit = 1000 } = req.query;
    
    if (!startDate || !endDate) {
      return next({ status: 400, message: 'Start date and end date are required' });
    }
    
    const logsList = await logsRepo.findByDateRange(new Date(startDate), new Date(endDate), parseInt(limit));
    res.json(logsList);
  } catch (error) {
    logger.error('Get logs by date range error:', error);
    next(error);
  }
}

/**
 * Get user action frequency analysis
 */
async function getUserActionFrequency(req, res, next) {
  try {
    // Only allow admins to access logs
    if (req.user.role !== 'ADMIN') {
      return next({ status: 403, message: 'Access denied' });
    }

    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next({ status: 400, message: 'Start date and end date are required' });
    }
    
    const frequencyData = await logsRepo.getUserActionFrequency(
      userId, 
      new Date(startDate), 
      new Date(endDate)
    );
    
    res.json(frequencyData);
  } catch (error) {
    logger.error('Get user action frequency error:', error);
    next(error);
  }
}

module.exports = {
  getLogs,
  getUserLogs,
  getEntityLogs,
  getLogsByDateRange,
  getUserActionFrequency,
}; 