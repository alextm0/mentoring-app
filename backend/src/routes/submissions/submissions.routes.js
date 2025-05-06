const express = require('express');
const router = express.Router();
const { 
  createSubmission, 
  getMenteeSubmissions, 
  getAssignmentSubmissions, 
  toggleCompleted 
} = require('../submissions/submissions.controller');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');

// POST /api/v1/submissions - Create a new submission (mentees only)
router.post('/',
  auth,
  rbac(['MENTEE']),
  createSubmission
);

// GET /api/v1/submissions/mine - List mentee's submissions (mentees only)
router.get('/mine',
  auth,
  rbac(['MENTEE']),
  getMenteeSubmissions
);

// GET /api/v1/submissions/:assignmentId - List all submissions for an assignment (mentors only)
router.get('/:assignmentId',
  auth,
  rbac(['MENTOR']),
  getAssignmentSubmissions
);

// PATCH /api/v1/submissions/:id/complete - Toggle completion status (mentors only)
router.patch('/:id/complete',
  auth,
  rbac(['MENTOR']),
  toggleCompleted
);

module.exports = router; 