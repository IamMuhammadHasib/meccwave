const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const csrf = require("csrf");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const csrfTokens = new csrf();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("MongoDB connection error: ", error);
  });

// CSRF protection middleware for routes where you want it
app.get("/csrf-token", (req, res) => {
  const token = csrfTokens.create(process.env.CSRF_SECRET || "secret-key");
  res.cookie("csrfToken", token);
  res.json({ csrfToken: token });
});

app.post("/secure-endpoint", (req, res) => {
  const csrfToken = req.cookies.csrfToken;
  if (csrfTokens.verify(process.env.CSRF_SECRET || "secret-key", csrfToken)) {
    res.json({ message: "Secure endpoint hit!" });
  } else {
    res.status(403).json({ message: "Invalid CSRF token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
