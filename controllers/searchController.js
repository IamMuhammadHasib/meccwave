const { User } = require("../models/User");
const userFields = require("../utils/constants/userFields");

class SearchController {
  static async getPeople(req, res) {
    try {
      const keyword = req.query.keyword;

      if (!keyword) {
        return res.status(400).json({
          statusCode: 400,
          message: "Keyword query parameter is required",
        });
      }

      // case-insensitive search
      const regex = new RegExp(keyword, "i");

      // Use aggregation to search both User and Profile collections
      const people = await User.aggregate([
        {
          $lookup: {
            from: "profiles", // The name of the Profile collection
            localField: "profile",
            foreignField: "_id",
            as: "profile",
          },
        },
        { $unwind: "$profile" }, // Flatten the profile array
        {
          $match: {
            $or: [
              { username: regex },
              { email: regex },
              { phone: regex },
              { "profile.name": regex }, // Search within the profile name
            ],
          },
        },
        {
          $project: {
            username: 1,
            "profile.name": 1,
            "profile.intro": 1,
            "profile.profilePicture": 1,
          },
        },
      ]);

      res.status(200).json({
        statusCode: 200,
        message: "Search results retrieved successfully",
        results: people,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        statusCode: 500,
        message: "Error retrieving search results",
      });
    }
  }
}

module.exports = SearchController;