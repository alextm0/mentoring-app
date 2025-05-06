const express = require('express');
const router = express.Router();
const { createComment, getSubmissionComments } = require('../comments/comments.controller');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');

// POST /api/v1/comments - Create a new comment (mentors only)
router.post('/', 
  auth,
  rbac(['MENTOR']),
  createComment
);

// GET /api/v1/comments/:submissionId - Get comments for a submission (mentor of assignment or mentee who submitted)
router.get('/:submissionId',
  auth,
  getSubmissionComments
);

module.exports = router; 