const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    content: {
      text: {
        type: String,
        required: false,
      },
      media: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Media",
          required: false,
        },
      ],
    },
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // User who reacted
        },
        reaction: {
          type: String,
          enum: ["like", "love", "haha", "wow", "angry", "sad"],
        },
        reactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      required: true,
    },
    sharedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = { Post, postSchema };
