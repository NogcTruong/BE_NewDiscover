const mongoose = require("mongoose");

const selectedTripSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  description: String,
  place: String,
  rating: Number,
  location: String,
  open_hours: String,
  close_hours: String,
  transportation: String,
  image_url: [String],
  distance: String,
  service: String,
  type: String,
  totalTripCost: Number,
  quantity: Number,
  ratingRange: String,
  dayNumber: Number,
  timeSlot: Number,
});

const CreateScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userRequireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserRequire",
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  selectedTrips: [selectedTripSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CreateSchedule", CreateScheduleSchema);
