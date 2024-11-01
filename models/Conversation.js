const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { Conversation, conversationSchema };
