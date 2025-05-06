const express = require('express');
const router = express.Router();

const authRoutes = require('./auth/auth.routes');
const usersRoutes = require('./users/users.routes');
const mentorsRoutes = require('./mentors/mentors.routes');
const assignmentsRoutes = require('./assignments/assignments.routes');
const resourcesRoutes = require('./resources/resources.routes');
const submissionsRoutes = require('./submissions/submissions.routes');
const commentsRoutes = require('./comments/comments.routes');

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