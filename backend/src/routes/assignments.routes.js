const express = require('express');
const {
  createAssignment,
  getAssignments,
  getMenteeAssignments,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignments.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Mentor routes
router.post('/', checkRole(['MENTOR']), createAssignment);
router.get('/', checkRole(['MENTOR']), getAssignments);
router.put('/:id', checkRole(['MENTOR']), updateAssignment);
router.delete('/:id', checkRole(['MENTOR']), deleteAssignment);

// Mentee routes
router.get('/mine', checkRole(['MENTEE']), getMenteeAssignments);

module.exports = router; 