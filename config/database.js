const mongoose = require("mongoose");

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
