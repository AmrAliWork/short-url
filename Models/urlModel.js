const mongoose = require("mongoose");
const urlSchema = new mongoose.Schema({
  mainURL: {
    type: String,
    required: [true, "Please provide the main Url!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Short URL must belong to user!"],
    index: true,
  },
  shortCode: {
    type: String,
    required: [true, "Short URL must have a code"],
    unique: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
});
const URL = mongoose.model("URL", urlSchema);
module.exports = URL;
