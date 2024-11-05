const { Conversation } = require("../models/Conversation");
const getRoomId = require("../utils/functions/messagingUtils");

class MessageController {
  static async getMessages(req, res) {
    try {
      const sender = req.user.id;
      const receiver = req.params.id;

      const roomId = getRoomId(sender, receiver);
      console.log(roomId);
      const conversation = await Conversation.findOne({roomId}).populate({
        path: "messages",
        select: "content media sentAt status",
        options: { sort: { sentAt: -1 }, limit: 15 },
        populate: [{ path: "senderId", select: "username" }, { path: "media" }],
      });

      if (!conversation) {
        return res.status(404).json({ message: "No conversation to show" });
      }

      return res.status(200).json({ messsages: conversation.messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = MessageController;
