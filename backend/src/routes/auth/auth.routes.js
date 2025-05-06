const express = require('express');
const { signup, login } = require('../auth/auth.controller');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;