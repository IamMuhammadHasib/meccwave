const { z } = require("zod");
const { PHONE_REGEX } = require("../utils/constants");

const numericWithOnePlus = /^(\+?\d+|\d+\+?\d*)$/;

const emailPhoneSchema = z
  .string()
  .refine(
    (value) => {
      const containsAtSymbol = value.includes("@");
      const isNumericWithPlus = numericWithOnePlus.test(value);

      return containsAtSymbol || isNumericWithPlus;
    },
    {
      message: "Invalid email address or phone number",
    }
  )
  .refine(
    (value) => {
      const containsAtSymbol = value.includes("@");

      return containsAtSymbol
        ? z.string().email().safeParse(value).success
        : true;
    },
    {
      message: "Invalid email address",
    }
  )
  .refine(
    (value) => {
      const isNumericWithPlus = numericWithOnePlus.test(value);

      return !value.includes("@") && isNumericWithPlus
        ? PHONE_REGEX.test(value)
        : true;
    },
    {
      message: "Invalid phone number",
    }
  );

module.exports = emailPhoneSchema;
