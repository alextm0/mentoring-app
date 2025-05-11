const { monitoredUsersRepo } = require('../../repos');
const logger = require('../../utils/logger');
const { z } = require('zod');

const resolveMonitoredUserSchema = z.object({
  resolution_notes: z.string().min(1)
});

/**
 * Get all active monitored users
 * Admin only endpoint
 */
async function getActiveMonitoredUsers(req, res, next) {
  try {
    // Only allow admins to access monitored users
    if (req.user.role !== 'ADMIN') {
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
 * Admin only endpoint
 */
async function getAllMonitoredUsers(req, res, next) {
  try {
    // Only allow admins to access monitored users
    if (req.user.role !== 'ADMIN') {
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
 * Admin only endpoint
 */
async function getMonitoredUserById(req, res, next) {
  try {
    // Only allow admins to access monitored users
    if (req.user.role !== 'ADMIN') {
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
 * Admin only endpoint
 */
async function resolveMonitoredUser(req, res, next) {
  try {
    // Only allow admins to resolve monitored users
    if (req.user.role !== 'ADMIN') {
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