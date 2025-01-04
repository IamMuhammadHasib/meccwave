const { Conversation } = require("../models/Conversation");
const { Message } = require("../models/Message");
const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

const getRoomId = (user1, user2) => {
  return [user1, user2].sort().join("-");
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", ({ userId, receiverId }) => {
      if (!userId || !receiverId) {
        console.error("Missing userId or receiverId");
        return;
      }

      const roomId = getRoomId(userId, receiverId);
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);

      socket.emit("joinedInRoom", { roomId, userId });
    });

    socket.on(
      "sendMessage",
      async ({ roomId, message, senderId, media = [] }) => {
        const messageId = new ObjectId(); // Generate a unique ID
        console.log(`Generated Message ID: ${messageId}`);

        const recipientId = roomId.split("-").find((id) => id !== senderId);
        console.log(`Recipient ID: ${recipientId}`);

        // Check if the recipient is active in the room
        const room = io.sockets.adapter.rooms.get(roomId);
        const isRecipientInRoom = room && room.has(recipientId);
        const isRecipientActive = io.sockets.sockets.get(recipientId); // Check if the recipient socket exists

        let status;
        if (isRecipientInRoom) {
          status = "seen";
        } else if (isRecipientActive) {
          status = "delivered";
        } else {
          status = "sent";
        }

        console.log(`Message status: ${status}`);

        // Emit the message with the appropriate status
        io.to(roomId).emit("receiveMessage", {
          messageId,
          message,
          senderId,
          media,
          status,
        });

        try {
          // Save the message to the database
          const newMessage = await Message.create({
            _id: messageId,
            senderId,
            content: message,
            media,
            sentAt: new Date(),
            status,
          });

          let conversation = await Conversation.findOne({ roomId });
          if (!conversation) {
            conversation = new Conversation({
              roomId,
              participants: roomId.split("-"),
              messages: [],
            });
            await conversation.save();
          }

          conversation.messages.push(newMessage._id);
          await conversation.save();

          console.log(
            `Message stored in DB for room ${roomId}: ${message}, Status: ${status}`
          );
        } catch (error) {
          console.error("Error storing message:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
