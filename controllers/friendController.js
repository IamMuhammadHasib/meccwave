const { Friendship } = require("../models/Friendship");
const userFields = require("../utils/constants/userFields");

class FriendController {
  static async getFriends(req, res) {
    try {
      const userId = req.user.id;

      // Find all friendships where the current user is either user1 or user2
      const friends = await Friendship.find({
        $or: [{ user1: userId }, { user2: userId }],
      })
        .populate({
          path: "user1",
          select: "username profile",
          populate: { path: "profile", select: userFields.REF_BASIC_PROFILE },
        })
        .populate({
          path: "user2",
          select: "username profile",
          populate: { path: "profile", select: userFields.REF_BASIC_PROFILE },
        });

      // Create a list of friends excluding the current user
      const friendList = friends.map((f) =>
        f.user1._id.equals(userId) ? f.user2 : f.user1
      );

      res.status(200).json({ statusCode: 200, friends: friendList });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ statusCode: 500, message: "Error fetching friends", error });
    }
  }

  static async deleteFriend(req, res) {
    const userId = req.user.id;
    const friendId = req.params.id;
    console.log(userId, friendId);

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
