const express = require('express');
const { getMe, getMentees } = require('../mentors/mentors.controller');
const auth = require('../../middleware/auth');
const checkRole = require('../../middleware/rbac');

const router = express.Router();

router.get('/me', auth, getMe);
router.get('/mentees', auth, checkRole(['MENTOR']), getMentees);
// TODO: Attach mentee
// TODO: Detach mentee

// TODO
// router.get('/mentor', auth, checkRole(['MENTEE']), getMentor);

module.exports = router; 