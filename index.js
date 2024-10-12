const express = require("express");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const friendRequestRoutes = require("./routes/friendRequestRoutes");
const connectDB = require("./config/database");
const setupMiddleware = require("./middlewares/middleware");

dotenv.config();
const app = express();
const PORT = process.env.PORT;

setupMiddleware(app);
connectDB();

// routes
app.use(authRoutes);
app.use("/friends", friendRoutes);
app.use("/friend-request", friendRequestRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
