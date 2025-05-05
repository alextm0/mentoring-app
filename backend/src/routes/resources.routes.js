const express = require('express');
const {
  createResource,
  getResources,
  getMenteeResources,
  getResourceById,
  updateResource,
  deleteResource
} = require('../controllers/resources.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Mentor routes
router.post('/', checkRole(['MENTOR']), createResource);
router.get('/', checkRole(['MENTOR']), getResources);
router.put('/:id', checkRole(['MENTOR']), updateResource);
router.delete('/:id', checkRole(['MENTOR']), deleteResource);

// Mentee routes
router.get('/mine', checkRole(['MENTEE']), getMenteeResources);

// Shared routes (accessible by both roles)
router.get('/:id', auth, getResourceById); // Role check handled in controller

module.exports = router; 