const { Conversation } = require("../models/Conversation");
const { Message } = require("../models/Message");
const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

// Utility to create a room ID for a conversation
const getRoomId = (user1, user2) => [user1, user2].sort().join("-");

module.exports = (io) => {
  // Active socket mapping: userId -> array of socket IDs
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Register user and map their socket
    socket.on("registerUser", ({ userId }) => {
      // const { userId } = data;
      console.log(userId);
      if (!userSockets.has(userId)) {
        userSockets.set(userId, []);
      }
      userSockets.get(userId).push(socket.id);
      socket.userId = userId; // Attach userId to the socket
      console.log(userSockets);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    // Send a message
    socket.on(
      "sendMessage",
      async ({ roomId, messageId, content, senderId, media = [], sentAt }) => {
        console.log(roomId);

        console.log(
          `Message from ${senderId} in ${roomId} with ID ${messageId}, message: ${content}`
        );

        // Save the message in the database
        try {
          const newMessage = await Message.create({
            _id: messageId,
            senderId,
            content,
            media,
            sentAt,
            status: "sent",
          });

          let conversation = await Conversation.findOne({ roomId }).populate(
            "participants",
            "_id"
          );
          if (!conversation) {
            console.error(`Conversation with roomId ${roomId} not found.`);
            return;
          }

          conversation.messages.push(newMessage._id);
          await conversation.save();

          // Identify all participants except the sender
          const recipients = conversation.participants.filter(
            (participant) => participant._id.toString() !== senderId
          );

          // Emit receiveMessage to all recipient sockets and sender sockets
          const senderSockets = userSockets.get(senderId) || [];
          console.log(userSockets, senderSockets);
          senderSockets.forEach((senderSocketId) => {
            io.to(senderSocketId).emit("receiveMessage", {
              roomId,
              messageId,
              senderId,
              content,
              media,
              sentAt,
            });
          });

          for (const recipient of recipients) {
            const recipientSockets =
              userSockets.get(recipient._id.toString()) || [];
            recipientSockets.forEach((recipientSocketId) => {
              io.to(recipientSocketId).emit("receiveMessage", {
                roomId,
                messageId,
                senderId,
                content,
                media,
                sentAt,
                status: "sent",
              });
            });
          }


          for (const recipient of recipients) {
            const recipientSockets =
            userSockets.get(recipient._id.toString()) || [];
            if (recipientSockets.length > 0) {
              // Notify sender sockets about delivery for each recipient
              const senderAckPayload = {
                roomId,
                messageIds: [messageId],
                receiverId: recipient._id, // The user who marked the messages as delivered
                deliveredAt: Date.now(),
                status: "delivered",
              };

              // Emit delivery ack to sender sockets
              senderSockets.forEach((senderSocketId) => {
                io.to(senderSocketId).emit("deliveredAck", senderAckPayload);
              });
              break;
            }
          }
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    );

    // Create a room for chat
    socket.on("createRoom", async ({ userId, participants }) => {
      if (
        !userId ||
        !Array.isArray(participants) ||
        participants.length === 0
      ) {
        console.log(userId, participants);
        console.error("Invalid userId or participants array");
        return;
      }

      let allParticipants = [userId, ...participants];
      allParticipants = allParticipants.sort((a, b) =>
        a.toString().localeCompare(b.toString())
      );
      let roomId;

      // Determine room type and generate unique room ID
      if (allParticipants.length === 2) {
        roomId = `private-${new ObjectId()}`;
      } else {
        roomId = `group-${new ObjectId()}`;
      }
      console.log(roomId);

      try {
        // Check if a conversation already exists
        const existingConversation = await Conversation.findOne({
          participants: allParticipants,
        });
        console.log(existingConversation);

        if (existingConversation) {
          console.log(
            `Existing conversation found: ${existingConversation.roomId}`
          );
          socket.emit("createRoomAck", {
            roomId: existingConversation.roomId,
          });
          return;
        }

        // Create a new conversation
        const newConversation = new Conversation({
          roomId,
          participants: allParticipants.map((id) => new ObjectId(id)),
          messages: [],
        });
        await newConversation.save();

        console.log(`Room created with ID: ${roomId}`);

        // Emit acknowledgment with the room ID
        socket.emit("createRoomAck", { roomId });
      } catch (error) {
        console.error("Error creating room:", error);
      }
    });

    // Handle message seen acknowledgment
    socket.on(
      "seenMessage",
      async ({ roomId, messageIds, receiverId, seenAt }) => {
        console.log(`User ${receiverId} marked messages as seen in ${roomId}`);

        try {
          // Update messages to "seen" in the database
          await Message.updateMany(
            { _id: { $in: messageIds }, roomId },
            { $set: { seenAt, status: "seen" } }
          );

          // Fetch all participants for the room
          const conversation = await Conversation.findOne({ roomId }).populate(
            "participants",
            "_id"
          );
          if (!conversation) {
            console.error(`Conversation with roomId ${roomId} not found.`);
            return;
          }

          const participants = conversation.participants;

          // Notify all participants about the seen status
          for (const participant of participants) {
            const participantSockets =
              userSockets.get(participant._id.toString()) || [];
            participantSockets.forEach((participantSocketId) => {
              io.to(participantSocketId).emit("seenAck", {
                roomId,
                messageIds,
                receiverId, // The user who marked the messages as seen
                seenAt,
                status: "seen",
              });
            });
          }
        } catch (error) {
          console.error("Error updating message status to 'seen':", error);
        }
      }
    );

    // Handle message delivered acknowledgment
    socket.on(
      "deliveredMessage",
      async ({ roomId, messageIds, receiverId, deliveredAt }) => {
        console.log(
          `User ${receiverId} marked messages as delivered in ${roomId}`
        );

        try {
          // Update messages to "delivered" in the database
          await Message.updateMany(
            { _id: { $in: messageIds }, roomId },
            { $set: { deliveredAt, status: "delivered" } }
          );

          // Fetch all participants for the room
          const conversation = await Conversation.findOne({ roomId }).populate(
            "participants",
            "_id"
          );
          if (!conversation) {
            console.error(`Conversation with roomId ${roomId} not found.`);
            return;
          }

          const participants = conversation.participants;

          // Notify all participants about the delivered status
          for (const participant of participants) {
            const participantSockets =
              userSockets.get(participant._id.toString()) || [];
            participantSockets.forEach((participantSocketId) => {
              io.to(participantSocketId).emit("deliveredAck", {
                roomId,
                messageIds,
                receiverId, // The user who marked the messages as delivered
                deliveredAt,
                status: "delivered",
              });
            });
          }
        } catch (error) {
          console.error("Error updating message status to 'delivered':", error);
        }
      }
    );

    // Handle user disconnection
    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId) {
        const sockets = userSockets.get(userId) || [];
        const updatedSockets = sockets.filter((id) => id !== socket.id);
        if (updatedSockets.length > 0) {
          userSockets.set(userId, updatedSockets);
        } else {
          userSockets.delete(userId);
        }
        console.log(`User ${userId} disconnected from socket ${socket.id}`);
      }
    });
  });
};
