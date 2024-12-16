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

  // async getCategories(req, res) {
  //   try {
  //     const categories = await destination.distinct("category");

  //     if (!categories || categories.length === 0) {
  //       return res.status(404).json({
  //         type: "error",
  //         message: "Không tìm thấy categories",
  //       });
  //     }

  //     res.status(200).json({
  //       type: "success",
  //       categories: categories,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       type: "error",
  //       message: "Lỗi khi lấy danh sách categories",
  //       error: error.message,
  //     });
  //   }
  // },

  // async getAddresses(req, res) {
  //   try {
  //     const addresses = await destination.distinct("address");

  //     if (!addresses || addresses.length === 0) {
  //       return res.status(404).json({
  //         type: "error",
  //         message: "Không tìm thấy địa chỉ nào",
  //       });
  //     }

  //     res.status(200).json({
  //       type: "success",
  //       addresses: addresses,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       type: "error",
  //       message: "Lỗi khi lấy danh sách địa chỉ",
  //       error: error.message,
  //     });
  //   }
  // },
};

module.exports = DestinationController;
