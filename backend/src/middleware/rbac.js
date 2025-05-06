const logger = require('../utils/errorHandler');

const rbac = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
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