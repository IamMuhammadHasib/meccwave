const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authenticationMiddleware');
const ProfileController = require('../controllers/profileController');

router.get('/profile', authenticate, ProfileController.getProfile);
router.get('/profile/:userId', authenticate, ProfileController.getProfile);

module.exports = router;