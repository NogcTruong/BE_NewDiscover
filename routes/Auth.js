const express = require('express');
const router = express.Router();

const { AuthController } = require('../Controllers');

router.post('/login', AuthController.login_user);
router.post('/signup', AuthController.sign_up);
router.post('/reset-password',AuthController.reset_password);
module.exports = router;