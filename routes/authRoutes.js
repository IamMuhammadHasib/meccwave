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
