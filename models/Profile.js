const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the media collection
      ref: "Media", // Assuming your media model is named 'Media'
      required: false,
    },
    coverPhoto: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the media collection
      ref: "Media", // Assuming your media model is named 'Media'
      required: false,
    },
    birthYear: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = { profileSchema, Profile };
