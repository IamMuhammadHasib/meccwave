const { FriendRequest } = require("../models/FriendRequest");
const { Friendship } = require("../models/Friendship");
const userFields = require("../utils/constants/userFields");

class FriendRequestController {
  static async sendFriendRequest(req, res) {
    try {
      const recipientId = req.params.id;
      const requesterId = req.user.id;

      if (recipientId === requesterId)
        return res
          .status(400)
          .json({ statusCode: 400, message: "That was funny" });

      const existingRequest = await FriendRequest.findOne({
        requesterId,
        recipientId,
      });

      if (existingRequest) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Friend request already sent" });
      }

      await FriendRequest.create({
        requesterId,
        recipientId,
        status: "pending",
      });

      res
        .status(201)
        .json({ statusCode: 201, message: "Friend request sent successfully" });
    } catch (error) {
      //   console.error("Error sending friend request", error);
      res.status(500).json({
        statusCode: 500,
        message: "Server error",
      });
    }
  }

  static async getReceivedFriendRequests(req, res) {
    try {
      console.log(req.user);
      const userId = req.user.id;

      const friendRequests = await FriendRequest.find({
        recipientId: userId,
        status: "pending",
      }).populate("requesterId", userFields.BASIC_INFO);

      res.status(200).json({
        statusCode: 200,
        message: "Friend request retrieved successfully",
        friendRequests,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ statusCode: 500, message: "Server error" });
    }
  }

  static async getSentFriendRequests(req, res) {
    try {
      const userId = req.user.id;

      const friendRequests = await FriendRequest.find({
        requesterId: userId,
        status: "pending",
      }).populate("requesterId", userFields.BASIC_INFO);

      res.status(200).json({
        statusCode: 200,
        message: "Friend request retrieved successfully",
        friendRequests,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ statusCode: 500, message: "Server error" });
    }
  }

  static async acceptFriendRequest(req, res) {
    const requesterId = req.params.id;
    const recipientId = req.user.id;

    const request = await FriendRequest.findOne({
      requesterId,
      recipientId,
    });

    if (!request) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Friend request not found" });
    }

    if (request.status === "accepted") {
      return res.status(400).json({
        statusCode: 400,
        message: "HAHA! Got you. Trying to accept the accepted?",
      });
    }

    request.status = "accepted";
    await request.save();

    await Friendship.create({
      user1: requesterId,
      user2: recipientId,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Friend request accepted successfully",
    });
  }

  static async deleteFriendRequest(req, res) {
    try {
      const userId = req.user.id;
      const requesterId = req.params.id;

      const friendRequest = await FriendRequest.findOneAndDelete({
        status: 'pending',
        $or: [
          { requesterId: userId, recipientId: requesterId },
          { recipientId: requesterId, recipientId: userId },
        ],
      });

      if (!friendRequest) {
        return res.status(404).json({
          statusCode: 404,
          message: "Friend request not found",
        });
      }

      res.status(200).json({
        statusCode: 200,
        message: "Friend request deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        statusCode: 500,
        message: "Error deleting friend request",
        error,
      });
    }
  }
}

module.exports = FriendRequestController;
