const express = require('express');
const { getMe, getMentees, getMentor } = require('../users/users.controller');
const { attachMentee, detachMentee } = require('../mentors/mentors.controller');
const auth = require('../../middleware/auth');
const checkRole = require('../../middleware/rbac');
const checkOwnership = require('../../middleware/ownership');

const router = express.Router();

router.use(auth);

router.get('/me', getMe);
router.get('/mentees', checkRole(['MENTOR']), getMentees);
router.get('/mentor', checkRole(['MENTEE']), getMentor);

router.post('/:userId/mentees', checkRole(['MENTOR']), checkOwnership, attachMentee);
router.delete('/:userId/mentees/:menteeId', checkRole(['MENTOR']), checkOwnership, detachMentee);

module.exports = router;