const express = require('express');
const router = express.Router();
const monitoredUsersController = require('./monitored-users.controller');
const authMiddleware = require('../../middleware/auth');

// All monitored users routes require authentication
router.use(authMiddleware);

// Get all active monitored users
router.get('/active', monitoredUsersController.getActiveMonitoredUsers);

// Get all monitored users (including resolved ones)
router.get('/', monitoredUsersController.getAllMonitoredUsers);

// Get monitored user by ID
router.get('/:id', monitoredUsersController.getMonitoredUserById);

// Resolve a monitored user
router.post('/:id/resolve', monitoredUsersController.resolveMonitoredUser);

module.exports = router; 