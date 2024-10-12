const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authenticationMiddleware');
const FriendController = require('../controllers/friendController');

router.get('/', authenticate, FriendController.getFriends);
router.delete('/:id', authenticate, FriendController.deleteFriend);

module.exports = router;