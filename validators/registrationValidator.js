const { z } = require("zod");

const emailPhoneSchema = require("../schema/emailPhoneSchema");
const passwordSchema = require("../schema/passwordSchema");
const nameSchema = require("../schema/nameSchema");
const genderSchema = require("../schema/genderSchema");
const birthYearSchema = require("../schema/birthYearSchema");

const registrationSchema = z.object({
  emailPhone: emailPhoneSchema,
  password: passwordSchema,
  name: nameSchema,
  gender: genderSchema,
  birthYear: birthYearSchema,
});

module.exports = registrationSchema;
