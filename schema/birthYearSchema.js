const { z } = require("zod");

const birthYearSchema = z
  .string({ message: "Invalid year format" })
  .transform((str) => Number(str))
  .refine((val) => !isNaN(val), { message: "Must be a valid number" })
  .refine((val) => Number.isInteger(val), { message: "Must be an integer" })
  .refine((val) => val >= 1900, {
    message: "Birth year can not be earlier than 1900",
  })
  .refine((val) => val <= (new Date().getFullYear() - 10), { message: "Birth year not allowed" });

module.exports = birthYearSchema;
