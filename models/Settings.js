const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = {settingsSchema, Settings};
