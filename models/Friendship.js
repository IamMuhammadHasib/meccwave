const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Friendship = mongoose.model("Friendship", friendshipSchema);

module.exports = { friendshipSchema, Friendship };
