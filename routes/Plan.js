const express = require('express');
const router = express.Router();
const UserRequireController = require('../Controllers/UserRequireController');
const PlanController = require('../Controllers/PlanController');

router.post('/', UserRequireController.createUserRequire);
router.post('/create/:id', PlanController.createPlan);

module.exports = router; 