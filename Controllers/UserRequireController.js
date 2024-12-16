const UserRequire = require("../models/userRequireModel");

const UserRequireController = {
  async createUserRequire(req, res) {
    try {
      const { userId, category, budget, totalDay, location, quantity } =
        req.body;

      // Validate required fields
      if (
        !userId ||
        !category ||
        !budget ||
        !totalDay ||
        !location ||
        !quantity
      ) {
        return res.status(400).json({
          type: "error",
          message:
            "All fields are required (userId, category, budget, totalDay, location, quantity)",
        });
      }

      // Validate data types
      if (!Array.isArray(category)) {
        return res.status(400).json({
          type: "error",
          message: "Category must be an array",
        });
      }

      if (typeof budget !== "number" || typeof totalDay !== "number") {
        return res.status(400).json({
          type: "error",
          message: "Budget and totalDay must be numbers",
        });
      }

      if (typeof location !== "string") {
        return res.status(400).json({
          type: "error",
          message: "Location must be a string",
        });
      }

      const newUserRequire = new UserRequire({
        userId,
        category,
        quantity,
        budget,
        totalDay,
        location,
      });

      const savedUserRequire = await newUserRequire.save();

      res.status(201).json({
        type: "success",
        userRequire: savedUserRequire,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "An error occurred while creating UserRequire.",
        error: error.message,
      });
    }
  },
};

module.exports = UserRequireController;
