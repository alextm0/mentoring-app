const logger = require('./logger');

/**
 * Centralised Express error‑handling middleware.
 * ------------------------------------------------
 * Always returns JSON in the shape:
 *   {
 *     "message": "<human‑readable>",
 *     "errors":  [ ... ]     // ← optional Zod details
 *   }
 */
module.exports = (err, req, res, next) => {
  logger.error(err.stack);

  const status  = err.status || 500;
  const payload = {
    message: err.message || 'Internal Server Error',
  };

  // forward Zod field‑level details when provided
  if (err.errors) {
    payload.errors = err.errors;
  }

  res.status(status).json(payload);
};
