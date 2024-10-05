const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to Users collection
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    size: {
      type: Number, // in bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    dimensions: {
      width: {
        type: Number,
        required: false,
      },
      height: {
        type: Number,
        required: false,
      },
    },
    metadata: {
      caption: {
        type: String,
        required: false,
      },
      location: {
        latitude: {
          type: Number,
          required: false,
        },
        longitude: {
          type: Number,
          required: false,
        },
      },
      tags: {
        type: [String],
        required: false,
      },
    },
    sourceType: {
      type: String,
      enum: ["Post", "Message"],
      required: true,
    },
    associatedSource: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sourceType", // This dynamically references either Post or Message based on sourceType
      required: false,
    },
    privacy: {
      type: String,
      enum: ["public", "private", "friends"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Media = mongoose.model("Media", mediaSchema);

module.exports = { mediaSchema, Media };
