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
        return res.success({ messages: [] }, "No messages found", 200);
      }

      return res.success(
        { messages: conversation.messages.reverse() },
        "Messages retrieved successfully",
        200
      );
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
      })
        .select("roomId participants")
        .populate({
          path: "participants",
          select: "username profile",
          populate: { path: "profile", select: "name profilePicture" },
        });

      if (!conversations.length) {
        return res.success(
          { chatList: [] },
          "Chat list retrieved successfully",
          200
        );
      }

      // Transform the data into the desired structure
      const chatPersonsList = conversations.map((conversation) => {
        // Find the other participant
        const otherParticipant = conversation.participants.find(
          (participant) => participant._id.toString() !== userId
        );

        return {
          id: otherParticipant?._id || "Unknown",
          roomId: conversation.roomId || "Unknown",
          username: otherParticipant?.username || "Unknown",
          name: otherParticipant?.profile?.name || "Unknown",
          profilePicture: otherParticipant?.profile?.profilePicture || null,
        };
      });

      return res.success(
        { chatList: chatPersonsList },
        "Chat list retrieved successfully",
        200
      );
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
        return res.error("No conversation found", 404);
      }

      // Extract undelivered messages from all conversations
      const undeliveredMessages = conversations.flatMap(
        (conversation) => conversation.messages
      );

      if (undeliveredMessages.length === 0) {
        return res.success(
          { messages: [] },
          "No undelivered messages found",
          200
        );
      }

      // // Update the status of undelivered messages to "delivered"
      // const messageIds = undeliveredMessages.map((message) => message._id);
      // await Message.updateMany(
      //   { _id: { $in: messageIds } },
      //   { $set: { status: "delivered" } }
      // );

      return res.success(
        { messages: undeliveredMessages },
        "Messages retrieved successfully",
        200
      );
    } catch (error) {
      console.error("Error fetching undelivered messages:", error);
      return res.error("Server error", 500);
    }
  }

  static async markMessagesAsSeen(req, res) {
    try {
      const { roomId, userId } = req.body;
      if (!roomId || !userId) {
        return res.error("Invalid request", 400);
      }

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
        return res.success({}, "No unseen message to mark", 200);
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

      return res.success({}, "Messages marked as seen", 200);
    } catch (error) {
      console.error("Error marking messages as seen:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async getMessageStatuses(req, res) {
    try {
      const { messageIds } = req.body;

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.error("Invalid or missing message IDs", 400);
      }

      // Fetch messages by their IDs
      const messages = await Message.find(
        { _id: { $in: messageIds } },
        "_id status" // Select only the _id and status fields
      );

      // Map messages to their statuses
      const statuses = messages.map((message) => ({
        messageId: message._id,
        status: message.status,
      }));

      // Return statuses
      return res.success(
        { statuses },
        "Message statuses retrieved successfully",
        200
      );
    } catch (error) {
      console.error("Error fetching message statuses:", error);
      return res.error("Server error", 500);
    }
  }
}

module.exports = MessageController;
