const mongoose = require("mongoose");
const { profileSchema } = require("./Profile");
const { friendSchema } = require("./Friend");
const { settingsSchema } = require("./Settings");

const validateContactInfo = function () {
  return this.email || this.phone;
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: profileSchema,
    friends: [friendSchema],
    settings: settingsSchema,
  },
  {
    timestamps: true,
  }
);

userSchema
  .path("email")
  .validate(
    validateContactInfo,
    "At least one of email or phone must be provided"
  );
userSchema
  .path("phone")
  .validate(
    validateContactInfo,
    "At least one of email or phone must be provided"
  );

const User = mongoose.model("User", userSchema);

module.exports = { userSchema, User };
