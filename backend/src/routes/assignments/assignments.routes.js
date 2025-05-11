const express = require('express');
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getMenteeAssignments,
  updateAssignment,
  deleteAssignment,
} = require('../assignments/assignments.controller');
const auth = require('../../middleware/auth');
const checkRole = require('../../middleware/rbac');

const router = express.Router();

router.use(auth);

router.post('/', checkRole(['MENTOR']), createAssignment);
router.get('/', checkRole(['MENTOR']), getAssignments);
router.get('/mine', checkRole(['MENTEE']), getMenteeAssignments);
router.get('/:id', checkRole(['MENTOR']), getAssignmentById);
router.put('/:id', checkRole(['MENTOR']), updateAssignment);
router.delete('/:id', checkRole(['MENTOR']), deleteAssignment);

module.exports = router;