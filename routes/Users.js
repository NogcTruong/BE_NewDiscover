const express = require('express');
const router = express.Router();

const { accessLevelVerifier, isAdminVerifier, authenticationVerifier } = require('../Middlewares/VerifyToken');
const { UserController } = require('../Controllers');

router.get('/', authenticationVerifier, UserController.get_user);
router.put("/update-user-details", authenticationVerifier, UserController.update_user_details);
router.delete('/delete',authenticationVerifier, UserController.delete_user);

module.exports = router;