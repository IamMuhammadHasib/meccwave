const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User who uploaded the media
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"], // Simple classification of media
      required: true,
    },
    url: {
      type: String, // URL pointing to the media file in storage
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Media = mongoose.model("Media", mediaSchema);

module.exports = { mediaSchema, Media };
