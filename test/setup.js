const mongoose = require("mongoose");
const User = require("../Models/userModel");
const loginLimiter = require("../middlewares/rateLimitMiddleware");
require("dotenv").config({ path: "./config.env" });

before(async () => {
  await mongoose.connect(process.env.DATABASE_URL_TEST);
  console.log("Test database connected!");
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.model("User").createIndexes();
});
after(async () => {
  await mongoose.disconnect();
  console.log("Test database disconnected!");
});
