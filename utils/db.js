const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.DATABASE_URL);

  isConnected = true;

  console.log("MongoDB connected successfully!");
};

module.exports = connectDB;
