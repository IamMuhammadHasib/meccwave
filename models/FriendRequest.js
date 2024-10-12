const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      /*
      ** pending - request has been sent
      ** accepted - request has been accepted, they are friend now
      ** ==========================================================
      ** this status will help to determine any people
      ** if they are friend, or not, or in friend request state
      */
      enum: ["pending", "accepted"],
      default: "pending",
    },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

module.exports = { friendRequestSchema, FriendRequest };
