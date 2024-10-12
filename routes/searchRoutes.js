const express = require('express');
const router = express.Router();

const SearchController = require('../controllers/searchController');
const authenticate = require('../middlewares/authenticationMiddleware');

router.get('/people', authenticate, SearchController.getPeople);

module.exports = router;