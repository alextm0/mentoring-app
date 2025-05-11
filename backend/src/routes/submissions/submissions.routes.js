const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getMenteeSubmissions,
  getAssignmentSubmissions,
  toggleCompleted,
  getAllMenteeSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getSubmissionWithComments,
  getMenteeSubmissionForAssignment,
} = require('../submissions/submissions.controller');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');

// Root path handles both GET (for mentors) and POST (for mentees)
router.route('/')
  .get(auth, rbac(['MENTOR']), getAllMenteeSubmissions)
  .post(auth, rbac(['MENTEE']), createSubmission);

router.get('/mine', auth, rbac(['MENTEE']), getMenteeSubmissions);
router.get('/assignment/:assignmentId', auth, rbac(['MENTOR']), getAssignmentSubmissions);

// Route for getting a submission with its comments
router.get('/:id/with-comments', auth, rbac(['MENTOR', 'MENTEE']), getSubmissionWithComments);

// Route for a mentee to get their own submission for a specific assignment
router.get('/assignment/:assignmentId/mine', auth, rbac(['MENTEE']), getMenteeSubmissionForAssignment);

// Routes for individual submissions
router.route('/:id')
  .get(auth, rbac(['MENTOR', 'MENTEE']), getSubmissionById)
  .put(auth, rbac(['MENTEE']), updateSubmission)
  .delete(auth, rbac(['MENTOR', 'MENTEE']), deleteSubmission);

router.patch('/:id/complete', auth, rbac(['MENTOR', 'MENTEE']), toggleCompleted);

module.exports = router;