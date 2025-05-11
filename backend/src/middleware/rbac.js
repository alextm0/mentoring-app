const logger = require('../utils/logger');

const rbac = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user object exists
      if (!req.user) {
        logger.error('RBAC error: req.user is undefined. User is not authenticated.');
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user has an allowed role
      if (!allowedRoles.includes(req.user.role)) {
        logger.error(`RBAC error: User ${req.user.id} with role ${req.user.role} attempted to access a resource requiring one of: ${allowedRoles.join(', ')}`);
        return res.status(403).json({ message: 'Access denied' });
      }
      
      next();
    } catch (error) {
      logger.error('RBAC error:', error);
      res.status(403).json({ message: 'Access denied' });
    }
  };
};

module.exports = rbac;