const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const searchRoutes = require("./searchRoutes");
const friendRoutes = require("./friendRoutes");
const friendRequestRoutes = require("./friendRequestRoutes");
const postRoutes = require("./postRoutes");

// Function to register all routes
const registerRoutes = (app) => {
  app.use(authRoutes);
  app.use("/user", userRoutes);
  app.use("/search", searchRoutes);
  app.use("/friends", friendRoutes);
  app.use("/friend-request", friendRequestRoutes);
  app.use("/posts", postRoutes);

  // Add future routes here
  // app.use("/posts", postsRoutes);
};

module.exports = registerRoutes;
