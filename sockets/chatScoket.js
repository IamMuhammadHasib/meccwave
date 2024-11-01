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
    });

    socket.on("sendMessage", ({ roomId, message, senderId }) => {
      io.to(roomId).emit("receiveMessage", { message, senderId });
      console.log(`Message sent in room ${roomId}: ${message}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
