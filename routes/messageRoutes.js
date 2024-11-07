const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticationMiddleware");
const MessageController = require("../controllers/messageController");

router.get("/:id/:time", authenticate, MessageController.getMessages);

module.exports = router;
