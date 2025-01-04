const { z } = require("zod");

const emailPhoneSchema = require("../schema/emailPhoneSchema");
const passwordSchema = require("../schema/passwordSchema");
const nameSchema = require("../schema/nameSchema");
const genderSchema = require("../schema/genderSchema");
const birthYearSchema = require("../schema/birthYearSchema");

const registrationSchema = z.object({
  name: nameSchema,
  gender: genderSchema,
  birthYear: birthYearSchema,
  emailPhone: emailPhoneSchema,
  password: passwordSchema,
});

module.exports = registrationSchema;
