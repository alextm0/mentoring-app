// src/middleware/auth.js
const jwt    = require('jsonwebtoken');
const env    = require('../config/env');
const logger = require('../utils/logger');

const JWT_REGEX = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

const auth = (req, res, next) => {
  // 1) Grab header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // 2) Expect "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const token = parts[1];

  // 3) Quick format check
  if (!JWT_REGEX.test(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // 4) Verify signature & expiration
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    logger.error('Authentication error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    // covers JsonWebTokenError: invalid signature, jwt malformed, etc.
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
