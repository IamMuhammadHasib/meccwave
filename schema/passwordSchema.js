const { z } = require("zod");

const { PASSWORD_REGEX } = require("../utils/constants");

const passwordSchema = z
  .string()
  .min(8)
  .refine((value) => PASSWORD_REGEX.test(value), {
    message:
      "Password must include at least two uppercase letters, two lowercase letters, two numbers, and two special characters",
  });

module.exports = passwordSchema;
