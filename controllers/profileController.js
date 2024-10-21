const { User } = require("../models/User");
const userFields = require("../utils/constants/userFields");

class ProfileController {
  static async getProfile(req, res) {
    try {
      const userId = req.params.userId;

      const userProfile = await User.findById(userId)
        .select(userFields.FULL_PROFILE)
        .populate("profile");

      if (!userProfile) {
        return res.status(404).json({
          statusCode: 404,
          message: "User profile not found",
        });
      }

      res.status(200).json({
        statusCode: 200,
        message: "Profile retrieved successfully",
        profile: userProfile,
      });
    } catch (error) {
      // console.log(error);
      res.status(500).json({
        statusCode: 500,
        message: "Error retrieving profile",
      });
    }
  }
}

module.exports = ProfileController;
