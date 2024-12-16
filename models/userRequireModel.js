const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "UserRequire";
const COLLECTION_NAME = "UserRequires";

const UserRequireSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    category: {
      type: [String],
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    quantity: {
      type: Number,
      require: true,
    },
    budget: {
      type: Number,
      require: true,
    },
    totalDay: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, UserRequireSchema);
