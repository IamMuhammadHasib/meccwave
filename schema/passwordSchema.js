const { z } = require("zod");

const { PASSWORD_REGEX } = require("../utils/constants/regex");

const passwordSchema = z
  .string({ message: "Invalid password" })
  .min(8, "Password must be at least 8 characters long")
  .refine((value) => PASSWORD_REGEX.test(value), {
    message:
      "Password must include at least two uppercase letters, two lowercase letters, two numbers, and two special characters",
  });

module.exports = passwordSchema;
