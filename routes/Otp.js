const express = require('express');
const otpController = require('../Controllers/OtpController');
const router = express.Router();
router.post('/send-otp', otpController.sendOTP);

module.exports = router;