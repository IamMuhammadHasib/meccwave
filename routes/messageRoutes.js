const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticationMiddleware");
const MessageController = require("../controllers/messageController");

router.get("/:id/:time", authenticate, MessageController.getMessages);
router.get("/chatList", authenticate, MessageController.getChatPersonsList);
router.get("/pullUnseen", authenticate, MessageController.getUndeliveredMessages);
router.post("/markAsSeen", authenticate, MessageController.markMessagesAsSeen);
router.post("/pullMessageStatus", authenticate, MessageController.getMessageStatuses);

module.exports = router;
