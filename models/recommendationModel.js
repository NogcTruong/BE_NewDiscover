const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Recommendation";
const COLLECTION_NAME = "Recommendations";

const RecommendationSchema = new Schema(
  {
    destinationId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "Destination",
    },
    status: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, RecommendationSchema);
