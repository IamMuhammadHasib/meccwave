const { z } = require("zod");

const nameSchema = z
  .string({ message: "Invalid name" })
  .min(1, "Name is required")
  .max(128, "Name is too long");

module.exports = nameSchema;
