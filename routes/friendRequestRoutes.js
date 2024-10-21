const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticationMiddleware");
const FriendRequestController = require("../controllers/friendRequestController");

router.post("/:id", authenticate, FriendRequestController.sendFriendRequest);
router.get(
  "/received",
  authenticate,
  FriendRequestController.getReceivedFriendRequests
);
router.get(
  "/sent",
  authenticate,
  FriendRequestController.getSentFriendRequests
);
router.post('/accept/:id', authenticate, FriendRequestController.acceptFriendRequest);
router.delete('/:id', authenticate, FriendRequestController.deleteFriendRequest);

module.exports = router;
