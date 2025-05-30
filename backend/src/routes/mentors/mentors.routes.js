const express = require('express');
const { attachMentee, getMentees, detachMentee } = require('../mentors/mentors.controller');
const auth = require('../../middleware/auth');
const checkRole = require('../../middleware/rbac');
const checkOwnership = require('../../middleware/ownership');

const router = express.Router();

router.use(auth);
router.use(checkRole(['MENTOR']));
router.use('/:mentorId', checkOwnership);

router.post('/:mentorId/mentees', attachMentee);
router.get('/:mentorId/mentees', getMentees);
router.delete('/:mentorId/mentees/:menteeId', detachMentee);

module.exports = router;