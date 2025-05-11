const express = require('express');
const router = express.Router();
const logsController = require('./logs.controller');
const authMiddleware = require('../../middleware/auth');

// All log routes require authentication
router.use(authMiddleware);

// Get all logs with pagination
router.get('/', logsController.getLogs);

// Get logs for a specific user
router.get('/user/:userId', logsController.getUserLogs);

// Get logs for a specific entity
router.get('/entity/:entityType/:entityId', logsController.getEntityLogs);

// Get logs within a date range
router.get('/date-range', logsController.getLogsByDateRange);

// Get user action frequency analysis
router.get('/user/:userId/frequency', logsController.getUserActionFrequency);

module.exports = router; 