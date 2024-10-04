const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
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
    dob: {
      type: Date,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

module.exports = {profileSchema, Profile};
