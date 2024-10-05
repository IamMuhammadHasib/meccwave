const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { setCsrfToken } = require("../middlewares/csrfMiddleware");
const { User } = require("../models/User");

class AuthController {
  static async register(req, res) {
    try {
      const { name, gender, birthYear, emailPhone, password } = req.body;

      // validate
      if (!name || !gender || !birthYear || !emailPhone || !password) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided" });
      }

      // determine email or phone
      const isEmail = /\S+@\S+\.\S+/.test(emailPhone); // email regex
      const contactField = isEmail
        ? { email: emailPhone }
        : { phone: emailPhone };

      const existingUser = await User.findOne(contactField);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email or phone is already in use" });
      }

      const username = await AuthController.generateUniqueUsername(name);

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        username,
        ...contactField,
        password: hashedPassword,
        profile: {
          name,
          gender,
          birthYear,
        },
      });

      await user.save();

      // JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async login(req, res) {
    try {
      const { emailPhone, password } = req.body;

      // validate
      if (!emailPhone || !password) {
        return res
          .status(400)
          .json({ message: "Email/Phone and password are required" });
      }

      // determine if email or phone
      const isEmail = /\S+@\S+\.\S+/.test(emailPhone); // Basic email regex
      const contactField = isEmail
        ? { email: emailPhone }
        : { phone: emailPhone };

      const user = await User.findOne(contactField);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Send response with JWT and CSRF token
      res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static getCsrfToken(req, res) {
    try {
      const csrfToken = setCsrfToken(req, res); // this will set the cookie
      res.status(200).json({ csrfToken });
    } catch (error) {
      console.error("Error generating CSRF token", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async generateUniqueUsername(name) {
    const username = name.toLowerCase().replace(/\s+/g, "");
    let existingUser = await User.findOne({ username });
    let counter = 0;

    while (existingUser) {
      counter++;
      existingUser = await User.findOne({ username: `${username}${counter}` });
    }

    return `${username}${counter}`;
  }
}

module.exports = AuthController;
