const { Conversation } = require("../models/Conversation");
const { Message } = require("../models/Message");
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
        select: "senderId content media sentAt status",
        options: { sort: { sentAt: -1 }, limit: 15 },
        populate: [{ path: "media" }],
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

  static async getUndeliveredMessages(req, res) {
    try {
      const userId = req.user.id;

      // Find all conversations where the user is a participant
      const conversations = await Conversation.find({
        participants: userId,
      }).populate({
        path: "messages",
        match: {
          senderId: { $ne: userId }, // Exclude messages sent by the current user
          status: "sent", // Only fetch messages with status "sent"
        },
        select: "senderId content media sentAt status",
        options: { sort: { sentAt: -1 } }, // Optional: Order by latest first
        populate: [{ path: "media" }],
      });

      if (!conversations || conversations.length === 0) {
        return res
          .status(404)
          .json({ message: "No undelivered messages found" });
      }

      // Extract undelivered messages from all conversations
      const undeliveredMessages = conversations.flatMap(
        (conversation) => conversation.messages
      );

      if (undeliveredMessages.length === 0) {
        return res.status(200).json({ messages: [] });
      }

      // Update the status of undelivered messages to "delivered"
      const messageIds = undeliveredMessages.map((message) => message._id);
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { status: "delivered" } }
      );

      return res.status(200).json({ messages: undeliveredMessages });
    } catch (error) {
      console.error("Error fetching undelivered messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async markMessagesAsSeen(req, res) {
    try {
      const { roomId, userId } = req.body;

      // Fetch the conversation and populate messages
      const conversation = await Conversation.findOne({
        roomId,
        participants: userId, // Ensure the user is a participant
      }).populate({
        path: "messages",
        match: {
          senderId: { $ne: userId }, // Exclude messages sent by the current user
          status: { $ne: "seen" }, // Update if not already marked as seen
        },
        select: "_id", // Only fetch message IDs for efficiency
      });

      if (!conversation || !conversation.messages.length) {
        return res
          .status(200)
          .json({ message: "No unseen messages found for this room" });
      }

      // Extract message IDs to update
      const messageIds = conversation.messages.map((msg) => msg._id);

      // Update the messages in the database
      const result = await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { status: "seen" } }
      );

      console.log(
        `${result.modifiedCount} messages marked as seen in room ${roomId}`
      );

      res.status(200).json({
        message: "Messages marked as seen"
      });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = MessageController;
