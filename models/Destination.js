const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Hotel", "Food", "Activity", "Sightseeing"],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    // priceNew: {
    //   type: Number,
    //   required: true,
    //   index: true,
    // },

    rating: {
      type: Number,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    open_hours: {
      type: String,
      required: true,
    },
    image_url: {
      type: [String],
      required: true,
    },
    distance: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true
    },
    lat: {
      type: Number, // Kinh độ
      required: false,
    },
    lng: {
      type: Number, // Vĩ độ
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", DestinationSchema);