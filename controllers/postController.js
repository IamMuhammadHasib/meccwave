const { Post } = require("../models/Post");
const { User } = require("../models/User");
const { Media } = require("../models/Media");

class postController {
  static async getUserPosts(req, res) {
    try {
      const { userId } = req.params;

      const posts = await Post.find({ author: userId })
        .populate({
          path: "author",
          select: "username profile",
          populate: { path: "profile", select: "name bio profilePicture" },
        })
        .populate({
          path: "content.media",
          select: "url type",
        })
        .sort({ createdAt: -1 });

      res.status(200).json({
        statusCode: 200,
        posts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        statusCode: 500,
        message: "Error fetching user's posts",
      });
    }
  }

  static async createPost(req, res) {
    try {
      const { text, media, visibility } = req.body;
      console.log(media);
      const userId = req.user.id;

      let mediaIds = [];
      if (media) {
        const enrichedMedia = media.map((item) => ({
          ...item,
          userId, // Add userId field
        }));
        const mediaDocuments = await Media.insertMany(enrichedMedia);
        mediaIds = mediaDocuments.map((doc) => doc._id);
      }

      const newPost = new Post({
        author: userId,
        content: {
          text,
          media: mediaIds, // Store ObjectIds here
        },
        visibility,
      });

      await newPost.save();

      res.status(201).json({
        statusCode: 201,
        message: "Post created successfully",
        post: newPost,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        statusCode: 500,
        message: "Error creating post",
      });
    }
  }
}

module.exports = postController;
