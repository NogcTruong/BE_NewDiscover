const mongoose = require("mongoose");

const ChatLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  question: {
    type: String,
    require: true,
  },
  answer: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("ChatLog", ChatLogSchema);
