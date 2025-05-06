const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getMenteeSubmissions,
  getAssignmentSubmissions,
  toggleCompleted,
} = require('../submissions/submissions.controller');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');

router.post('/', auth, rbac(['MENTEE']), createSubmission);
router.get('/mine', auth, rbac(['MENTEE']), getMenteeSubmissions);
router.get('/:assignmentId', auth, rbac(['MENTOR']), getAssignmentSubmissions);
router.patch('/:id/complete', auth, rbac(['MENTOR']), toggleCompleted);

module.exports = router;