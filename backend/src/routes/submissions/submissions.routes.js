const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getMenteeSubmissions,
  getAssignmentSubmissions,
  toggleCompleted,
  getAllMenteeSubmissions,
} = require('../submissions/submissions.controller');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');

// Root path handles both GET (for mentors) and POST (for mentees)
router.route('/')
  .get(auth, rbac(['MENTOR']), getAllMenteeSubmissions)
  .post(auth, rbac(['MENTEE']), createSubmission);

router.get('/mine', auth, rbac(['MENTEE']), getMenteeSubmissions);
router.get('/:assignmentId', auth, rbac(['MENTOR']), getAssignmentSubmissions);
router.patch('/:id/complete', auth, rbac(['MENTOR']), toggleCompleted);

module.exports = router;