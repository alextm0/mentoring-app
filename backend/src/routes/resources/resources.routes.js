const express = require('express');
const {
  createResource,
  getResources,
  getMenteeResources,
  getResourceById,
  updateResource,
  deleteResource,
} = require('../resources/resources.controller');
const auth = require('../../middleware/auth');
const checkRole = require('../../middleware/rbac');

const router = express.Router();

router.use(auth);

router.post('/', checkRole(['MENTOR']), createResource);
router.get('/', checkRole(['MENTOR']), getResources);
router.put('/:id', checkRole(['MENTOR']), updateResource);
router.delete('/:id', checkRole(['MENTOR']), deleteResource);

router.get('/mine', checkRole(['MENTEE']), getMenteeResources);

router.get('/:id', auth, getResourceById);

module.exports = router;