const destination = require("../models/Destination");

const DestinationController = {
  async listDestinationByType(req, res, next) {
    const { type } = req.query;
    try {
      const query = type ? { type } : {};
      const destinations = await destination.find(query);
      // console.log("Destinations fetched:", destinations);
      res.status(200).json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Lỗi khi lấy danh sách destination" });
    }
  },

  async getCategories(req, res) {
    try {
      // Sử dụng distinct để lấy danh sách category không trùng lặp
      const categories = await destination.distinct("category");

      // Kiểm tra nếu không có categories
      if (!categories || categories.length === 0) {
        return res.status(404).json({
          type: "error",
          message: "Không tìm thấy danh mục nào",
        });
      }

      // Sắp xếp categories theo thứ tự alphabet
      const sortedCategories = categories.sort((a, b) => a.localeCompare(b));

      return res.status(200).json({
        status: true,
        message: "Lấy danh sách danh mục thành công",
        total: sortedCategories.length,
        categories: sortedCategories,
      });
    } catch (error) {
      console.error("Error in getCategories:", error);
      return res.status(500).json({
        status: false,
        message: "Đã xảy ra lỗi khi lấy danh sách danh mục",
        error: error.message,
      });
    }
  },

  async getAddresses(req, res) {
    try {
      const locations = await destination.distinct("location");

      if (!locations || locations.length === 0) {
        return res.status(404).json({
          type: "error",
          message: "Không tìm thấy địa chỉ nào",
        });
      }

      res.status(200).json({
        type: "success",
        addresses: locations,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Lỗi khi lấy danh sách địa chỉ",
        error: error.message,
      });
    }
  },
};

module.exports = DestinationController;
