const express = require('express');
const router = express.Router();

const { FiltersController } = require('../Controllers');

router.get('/search',  FiltersController.Search);
router.post('/filter',FiltersController.Filter);

module.exports = router;