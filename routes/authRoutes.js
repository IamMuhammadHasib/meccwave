const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");
const loginSchema = require("../validators/loginValidator");
const validate = require("../middlewares/validateMiddlware");
const registrationSchema = require("../validators/registrationValidator");

router.get("/csrf-token", AuthController.getCsrfToken);
router.post("/register", validate(registrationSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);

module.exports = router;

/******************************************************
{
for validating, i called the validate method as
const validate = (schema) => {
  return (req, res, next) => {
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.errors });
    }

    next();
  };
};

module.exports = validate;

with validators/registrations.js file as
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

that uses schema/nameSchema.js like
const { z } = require("zod");

const nameSchema = z.string().max(128);

module.exports = nameSchema;
}
******************************************************/
