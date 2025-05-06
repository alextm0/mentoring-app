const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  logger.info('Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
};

module.exports = requestLogger;