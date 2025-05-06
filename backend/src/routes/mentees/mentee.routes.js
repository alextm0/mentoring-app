const express = require('express');
const { getMe, getMentorDetails } = require('../controllers/mentee.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

router.use(auth);
router.use(checkRole(['MENTEE']));

router.get('/me', getMe);
router.get('/mentor', getMentorDetails);

module.exports = router;