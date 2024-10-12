const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticationMiddleware");
const FriendRequestController = require("../controllers/friendRequestController");

router.post("/", authenticate, FriendRequestController.sendFriendRequest);
// router.delete('/:id', authenticate, FriendController.deleteFriend);

module.exports = router;
