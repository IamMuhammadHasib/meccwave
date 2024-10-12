const { FriendRequest } = require("../models/FriendRequest");

class FriendRequestController {
  static async sendFriendRequest(req, res) {
    try {
      const { recipientId } = req.body;
      const requesterId = req.user.id;

      const existingRequest = await FriendRequest.findOne({
        requesterId,
        recipientId,
      });

      if (existingRequest) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Friend request already sent" });
      }

      const newRequest = await FriendRequest.create({
        requesterId,
        recipientId,
        status: "pending",
      });

      res.status(201).json(newRequest);
    } catch (error) {
    //   console.error("Error sending friend request", error);
      res.status(500).json({
        statusCode: 500,
        message: "Server error",
      });
    }
  }
}

module.exports = FriendRequestController;
