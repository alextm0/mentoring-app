const { monitoredUsersRepo } = require('../../repos');
const { usersRepo } = require('../../repos');
const logger = require('../../utils/logger');
const { z } = require('zod');

const resolveMonitoredUserSchema = z.object({
  resolution_notes: z.string().min(1)
});

/**
 * Check if user is authorized to access monitored users
 * Allow admin or specific mentor (alextoma1704@gmail.com)
 */
async function isAuthorizedForMonitoring(user) {
  // Admin role-based check can be done directly
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // For mentor check, first try to use email from the token
  if (user.role === 'MENTOR') {
    if (user.email) {
      // If email is already in the token, use it directly
      return user.email === 'alextoma1704@gmail.com';
    }
    
    // Fallback: fetch email from the database if not in token
    try {
      // Get user details to check email
      const userDetails = await usersRepo.findById(user.id);
      if (!userDetails) {
        logger.error(`User not found: ${user.id}`);
        return false;
      }
      return userDetails.email === 'alextoma1704@gmail.com';
    } catch (error) {
      logger.error('Authorization check error:', error);
      return false; // Fail closed on error
    }
  }
  
  return false;
}

/**
 * Get all active monitored users
 * Admin or specific mentor only endpoint
 */
async function getActiveMonitoredUsers(req, res, next) {
  try {
    // Check if user is authorized (admin or specific mentor)
    const isAuthorized = await isAuthorizedForMonitoring(req.user);
    if (!isAuthorized) {
      return next({ status: 403, message: 'Access denied' });
    }

    const monitoredUsers = await monitoredUsersRepo.getActiveMonitoredUsers();
    res.json(monitoredUsers);
  } catch (error) {
    logger.error('Get active monitored users error:', error);
    next(error);
  }
}

/**
 * Get all monitored users (including resolved ones)
 * Admin or specific mentor only endpoint
 */
async function getAllMonitoredUsers(req, res, next) {
  try {
    // Check if user is authorized (admin or specific mentor)
    const isAuthorized = await isAuthorizedForMonitoring(req.user);
    if (!isAuthorized) {
      return next({ status: 403, message: 'Access denied' });
    }

    const monitoredUsers = await monitoredUsersRepo.getAllMonitoredUsers();
    res.json(monitoredUsers);
  } catch (error) {
    logger.error('Get all monitored users error:', error);
    next(error);
  }
}

/**
 * Get monitored user by ID
 * Admin or specific mentor only endpoint
 */
async function getMonitoredUserById(req, res, next) {
  try {
    // Check if user is authorized (admin or specific mentor)
    const isAuthorized = await isAuthorizedForMonitoring(req.user);
    if (!isAuthorized) {
      return next({ status: 403, message: 'Access denied' });
    }

    const { id } = req.params;
    const monitoredUser = await monitoredUsersRepo.getMonitoredUserById(id);
    
    if (!monitoredUser) {
      return next({ status: 404, message: 'Monitored user not found' });
    }
    
    res.json(monitoredUser);
  } catch (error) {
    logger.error('Get monitored user by ID error:', error);
    next(error);
  }
}

/**
 * Resolve a monitored user (mark as inactive)
 * Admin or specific mentor only endpoint
 */
async function resolveMonitoredUser(req, res, next) {
  try {
    // Check if user is authorized (admin or specific mentor)
    const isAuthorized = await isAuthorizedForMonitoring(req.user);
    if (!isAuthorized) {
      return next({ status: 403, message: 'Access denied' });
    }

    const { id } = req.params;
    const validated = resolveMonitoredUserSchema.parse(req.body);
    
    const monitoredUser = await monitoredUsersRepo.getMonitoredUserById(id);
    if (!monitoredUser) {
      return next({ status: 404, message: 'Monitored user not found' });
    }
    
    if (!monitoredUser.is_active) {
      return next({ status: 400, message: 'Monitored user is already resolved' });
    }
    
    const resolved = await monitoredUsersRepo.resolveMonitoredUser(
      id, 
      req.user.id, 
      validated.resolution_notes
    );
    
    res.json(resolved);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next({ status: 400, message: 'Validation error', errors: error.errors });
    }
    logger.error('Resolve monitored user error:', error);
    next(error);
  }
}

module.exports = {
  getActiveMonitoredUsers,
  getAllMonitoredUsers,
  getMonitoredUserById,
  resolveMonitoredUser
}; 