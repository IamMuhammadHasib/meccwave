const commentSchema = new mongoose.Schema(
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // Reference to the related post
        required: true,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Author of the comment
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", // Reference to a parent comment (if it's a reply)
        required: false,
      },
      replies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment", // List of reply comments
        },
      ],
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
    },
    { timestamps: true }
  );

  const Comment = mongoose.model("Comment", commentSchema);

  module.exports = { Comment, commentSchema };
