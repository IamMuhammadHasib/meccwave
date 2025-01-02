const { Conversation } = require("../models/Conversation");
const getRoomId = require("../utils/functions/messagingUtils");

class MessageController {
  static async getMessages(req, res) {
    try {
      const sender = req.user.id;
      const receiver = req.params.id;
      const time = req.params.time;

      const roomId = getRoomId(sender, receiver);
      console.log(roomId);
      const conversation = await Conversation.findOne({ roomId }).populate({
        path: "messages",
        match: { sentAt: { $lt: new Date(time) } },
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

  static async getChatPersonsList(req, res) {
    try {
      const userId = req.user.id;

      // Find all conversations where the user is a participant
      const conversations = await Conversation.find({
        participants: userId,
      }).populate({
        path: "participants",
        select: "username profile",
        populate: { path: "profile", select: "name profilePicture" },
      });

      if (!conversations.length) {
        return res.status(404).json({ message: "No chats found" });
      }

      // Transform the data into the desired structure
      const chatPersonsList = conversations.map((conversation) => {
        // Find the other participant
        const otherParticipant = conversation.participants.find(
          (participant) => participant._id.toString() !== userId
        );

        return {
          username: otherParticipant?.username || "Unknown",
          name: otherParticipant?.profile?.name || "Unknown",
          profilePicture: otherParticipant?.profile?.profilePicture || null,
        };
      });

      return res.status(200).json(chatPersonsList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = MessageController;
