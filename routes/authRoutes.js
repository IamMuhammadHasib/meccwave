const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");

router.get("/csrf-token", AuthController.getCsrfToken);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;
