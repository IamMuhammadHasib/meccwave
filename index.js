const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/database");
const setupMiddleware = require("./middlewares/middleware");
const socketAuth = require("./middlewares/socketAuthMiddleware");
const chatSocket = require("./sockets/chatScoket");
const registerRoutes = require("./routes/index");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if not defined

const startServer = async () => {
  try {
    await connectDB();
    setupMiddleware(app);

    // Create the HTTP and WebSocket servers
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*", // Adjust according to your needs
        methods: ["GET", "POST"],
      },
    });
    io.use(socketAuth);
    chatSocket(io);

    // Register all routes
    registerRoutes(app);

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
