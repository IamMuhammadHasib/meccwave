const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json("What?! Looking for something? Go elsewhere...");
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
