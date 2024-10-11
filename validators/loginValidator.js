const { z } = require("zod");

const passwordSchema = require("../schema/passwordSchema");
const emailPhoneSchema = require("../schema/emailPhoneSchema");

const loginSchema = z.object({
  emailPhone: emailPhoneSchema,
  password: passwordSchema,
});

module.exports = loginSchema;
