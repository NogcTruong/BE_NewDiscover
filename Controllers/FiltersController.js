const { model } = require('mongoose');
const Destination = require('../models/Destination');

const FiltersController = {
    // Search method with text index
    async Search(req, res) {
        try {
            // Kiểm tra nếu query tìm kiếm không tồn tại
            if (!req.query.q) {
                return res.status(400).json({
                    type: "error",
                    message: "Query tìm kiếm không được để trống.",
                });
            }

            let searchQuery;
            const queryText = req.query.q.trim();

            if (queryText.includes(" ") || queryText.length > 1) {
                // Tìm kiếm cụm từ chính xác hoặc từ có độ dài lớn hơn 1 ký tự
                searchQuery = { $text: { $search: `"${queryText}"` } };
            } else {
                // Tìm kiếm một ký tự hoặc từ ngắn, sử dụng regex
                searchQuery = { name: { $regex: queryText, $options: "i" } };
            }

            // Tìm các tài liệu phù hợp với điều kiện tìm kiếm
            const docs = await Destination.find(searchQuery);

            // Trả kết quả
            res.status(200).json({
                type: "success",
                docs,
            });
        } catch (error) {
            // Xử lý lỗi
            res.status(500).json({
                type: "error",
                message: "Đã xảy ra lỗi trong quá trình tìm kiếm.",
                error: error.message,
            });
        }
    },


    // Filter method
    async Filter(req, res) {
        try {
          const { location, service, rating, minPrice, maxPrice, category, page = 1, limit = 10 } = req.body;
    
          const filter = {};
    
          // Kiểm tra và áp dụng các bộ lọc
          if (location && location.length) filter.location = { $in: location };
          if (service && service.length) filter.service = { $in: service };
          if (category && category.length) filter.category = { $in: category };
        //   if (rating && rating.length) filter.rating = { $in: rating.map(Number) };
        if (rating) {
            const ratingValue = parseFloat(rating);
            if (ratingValue === 5) {
              filter.rating = { $eq: 5 }; // Chỉ lấy kết quả có rating đúng bằng 5
            } else if (ratingValue === 4) {
              filter.rating = { $gte: 4, $lte: 5 }; // Lấy rating từ 4 đến 5
            } else if (ratingValue === 3) {
              filter.rating = { $gte: 3, $lte: 5 }; // Lấy rating từ 3 đến 5
            }
          }
          if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
          if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    
          const skip = (parseInt(page) - 1) * parseInt(limit);
          const docs = await Destination.find(filter).skip(skip).limit(parseInt(limit)).exec();
          const totalDocs = await Destination.countDocuments(filter);
    
          res.status(200).json({
            type: "success",
            page: parseInt(page),
            limit: parseInt(limit),
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            docs,
          });
        } catch (error) {
          console.error("Lỗi trong quá trình lọc:", error);
          res.status(500).json({ type: "error", message: "Lỗi server.", error: error.message });
        }
      },
};

module.exports = FiltersController;