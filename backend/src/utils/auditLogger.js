const logsRepo = require('../repos/logs.repo');
const logger = require('./logger');

/**
 * Log a user action to the database
 * This function is designed to be non-blocking and fail gracefully
 */
const logUserAction = async (req, action, entityType, entityId, details = '') => {
  try {
    // Skip logging if no user is authenticated
    if (!req.user || !req.user.id) {
      return null;
    }

    const logData = {
      user_id: req.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown'
    };

    // We don't await this promise to prevent blocking the main application flow
    // Instead, we handle errors internally
    const logPromise = logsRepo.create(logData);
    
    // Handle the promise without blocking
    logPromise.catch(error => {
      logger.error(`Failed to log user action: ${error.message}`, {
        error,
        logData
      });
    });

    return logPromise;
  } catch (error) {
    // Log the error but don't propagate it to avoid disrupting the main flow
    logger.error(`Exception in logUserAction: ${error.message}`, { error });
    return null;
  }
};

// Constants for action types
const ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN'
};

// Constants for entity types
const ENTITIES = {
  USER: 'users',
  ASSIGNMENT: 'assignments',
  RESOURCE: 'resources',
  SUBMISSION: 'submissions',
  COMMENT: 'comments'
};

module.exports = {
  logUserAction,
  ACTIONS,
  ENTITIES
}; 