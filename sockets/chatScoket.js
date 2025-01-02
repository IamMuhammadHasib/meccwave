const { Conversation } = require("../models/Conversation");
const { Message } = require("../models/Message");

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

      socket.emit("joinedInRoom", { roomId });
    });

    socket.on(
      "sendMessage",
      async ({ roomId, message, senderId, media = [] }) => {
        io.to(roomId).emit("receiveMessage", { message, senderId, media });

        try {
          let conversation = await Conversation.findOne({ roomId });

          if (!conversation) {
            conversation = new Conversation({
              roomId,
              participants: [senderId],
              messages: [],
            });
            await conversation.save();
          }

          const newMessage = await Message.create({
            senderId,
            content: message,
            media,
            sentAt: new Date(),
            status: "sent",
          });

          conversation.messages.push(newMessage._id);
          await conversation.save();

          console.log(`Message stored in DB for room ${roomId}: ${message}`);
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
