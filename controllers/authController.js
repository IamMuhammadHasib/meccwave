const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const { setCsrfToken } = require("../middlewares/csrfMiddleware");
const { User } = require("../models/User");
const { Profile } = require("../models/Profile");

class AuthController {
  static async register(req, res) {
    try {
      const { name, gender, birthYear, emailPhone, password } = req.body;

      // email or phone
      const isEmail = /\S+@\S+\.\S+/.test(emailPhone);
      const contactField = isEmail
        ? { email: emailPhone }
        : { phone: emailPhone };

      const existingUser = await User.findOne(contactField);
      if (existingUser) {
        return res.error("Email or phone is already in use", 400);
      }

      const username = await AuthController.generateUniqueUsername(name);
      const hashedPassword = await bcrypt.hash(password, 10);

      const profile = new Profile({
        name,
        gender,
        birthYear,
      });
      await profile.save();

      const user = new User({
        username,
        ...contactField,
        password: hashedPassword,
        profile: profile._id,
      });

      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // profile data
      const populatedUser = await User.findById(user.id)
        .populate({
          path: "profile",
          select: "name profilePicture",
          populate: {
            path: "profilePicture",
            select: "url",
          },
        })
        .select("username profile");

      return res.success(
        {
          token,
          user: {
            id: populatedUser.id,
            username: populatedUser.username,
            profile: {
              name: populatedUser.profile.name,
              profilePicture: populatedUser.profile.profilePicture?.url || null,
            },
          },
        },
        "User registered successfully",
        201
      );
    } catch (error) {
      console.error(error);
      return res.error("Server error", 500);
    }
  }

  static async login(req, res) {
    try {
      const { emailPhone, password } = req.body;

      // determine if email or phone
      const isEmail = /\S+@\S+\.\S+/.test(emailPhone); // Basic email regex
      const contactField = isEmail
        ? { email: emailPhone }
        : { phone: emailPhone };

      const user = await User.findOne(contactField);
      if (!user) {
        return res.error("User not found", 404);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.error("Invalid credentials", 400);
      }

      // token generation
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const populatedUser = await User.findById(user.id)
        .populate({
          path: "profile",
          select: "name profilePicture",
          populate: {
            path: "profilePicture",
            select: "url",
          },
        })
        .select("username profile");

      return res.success(
        {
          token,
          user: {
            id: populatedUser.id,
            username: populatedUser.username,
            profile: {
              name: populatedUser.profile.name,
              profilePicture: populatedUser.profile.profilePicture?.url || null,
            },
          },
        },
        "Login successful",
        200
      );
    } catch (error) {
      console.error(error);
      return res.error("Server error", 500);
    }
  }

  static getCsrfToken(req, res) {
    try {
      const csrfToken = setCsrfToken(req, res); // this will set the cookie
      return res.success({ csrfToken }, "CSRF token generated successfully", 200);
    } catch (error) {
      console.error("Error generating CSRF token", error);
      return res.error("Server error", 500);
    }
  }

  static async generateUniqueUsername(name) {
    const username = name.toLowerCase().replace(/\s+/g, ""); // removing spaces

    let uniquePart = uuidv4().slice(0, 6);
    let existingUser = await User.findOne({
      username: `${username}-${uniquePart}`,
    });
    while (existingUser) {
      uniquePart = uuidv4().slice(0, 6);
      existingUser = await User.findOne({
        username: `${username}-${uniquePart}`,
      });
    }

    return `${username}-${uniquePart}`;
  }
}

module.exports = AuthController;
