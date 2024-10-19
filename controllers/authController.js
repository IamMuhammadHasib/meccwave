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
        return res.status(400).json({
          statusCode: 400,
          message: "Email or phone is already in use",
        });
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

      // Populate the profile data
      const populatedUser = await User.findById(user.id)
        .populate({
          path: "profile",
          select: "name profilePicture", // Only return the necessary fields from the Profile
          populate: {
            path: "profilePicture", // Assuming profilePicture references a Media model
            select: "url", // Only return the URL of the profile picture
          },
        })
        .select("username profile");

      res.status(201).json({
        statusCode: 201,
        message: "User registered successfully",
        token,
        user: {
          id: populatedUser.id,
          username: populatedUser.username,
          profile: {
            name: populatedUser.profile.name,
            profilePicture: populatedUser.profile.profilePicture?.url || null, // Return profile picture URL if available
          },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ statusCode: 500, message: "Server error" });
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
        return res
          .status(404)
          .json({ statusCode: 404, message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Invalid credentials" });
      }

      // Generate JWT token
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

      res.status(200).json({
        statusCode: 200,
        message: "Login successful",
        token,
        user: {
          id: populatedUser.id,
          username: populatedUser.username,
          profile: {
            name: populatedUser.profile.name,
            profilePicture: populatedUser.profile.profilePicture?.url || null,
          },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ statusCode: 500, message: "Server error" });
    }
  }

  static getCsrfToken(req, res) {
    try {
      const csrfToken = setCsrfToken(req, res); // this will set the cookie
      res.status(200).json({ statusCode: 200, csrfToken });
    } catch (error) {
      console.error("Error generating CSRF token", error);
      res.status(500).json({ statusCode: 500, message: "Server error" });
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
