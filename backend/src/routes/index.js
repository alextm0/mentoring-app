const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const mentorsRoutes = require('./mentors.routes');
const assignmentsRoutes = require('./assignments.routes');
const resourcesRoutes = require('./resources.routes');
const submissionsRoutes = require('./submissions.routes');
const commentsRoutes = require('./comments.routes');

// API version prefix
const API_PREFIX = '/api/v1';

// Register routes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, usersRoutes);
router.use(`${API_PREFIX}/mentors`, mentorsRoutes);
router.use(`${API_PREFIX}/assignments`, assignmentsRoutes);
router.use(`${API_PREFIX}/resources`, resourcesRoutes);
router.use(`${API_PREFIX}/submissions`, submissionsRoutes);
router.use(`${API_PREFIX}/comments`, commentsRoutes);

// Export the router
module.exports = router; 