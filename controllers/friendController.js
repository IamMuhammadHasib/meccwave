const { Friendship } = require("../models/Friendship");

class FriendController {
  static async getFriends(req, res) {
    try {
      const userId = req.user._id;
      const friends = await Friendship.find({
        $or: [{ user1: userId }, { user2: userId }],
      })
        .populate("user1", "username profile")
        .populate("user2", "username profile");

      const friendList = friends.map((f) =>
        f.user1._id.equals(userId) ? f.user2 : f.user1
      );

      res.staus(200).json({ statusCode: 200, friends: friendList });
    } catch (error) {
      res
        .status(500)
        .json({ statusCode: 500, message: "Error fetching friends", error });
    }
  }

  static async deleteFriend(req, res) {
    const userId = req.user._id;
    const friendId = req.params.id;

    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId },
      ],
    });

    if (!friendship) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Friend not found" });
    }

    res
      .status(200)
      .json({ statusCode: 200, message: "Friend removed successfully" });
  }
}

module.exports = FriendController;
