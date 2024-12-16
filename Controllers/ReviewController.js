const Destination = require("../models/Destination");
const Review = require('../models/Review');
const path = require('path');
const fs = require('fs');


const ReviewController = {

    async create_review(req, res) {
        try {
            const user_id = req.user.id;
            const { destination_id, rating, review, image,video } = req.body;

            // Kiểm tra rating hợp lệ
            if (rating < 1 || rating > 5) {
                return res.status(422).json({
                    type: "error",
                    message: "Rating must be between 1 and 5.",
                });
            }

            // Cập nhật hoặc tạo mới review
            const is_update = await Review.updateOne(
                { user_id: user_id, destination_id: destination_id },
                {
                    "$set": {
                        user_id: user_id,
                        destination_id: destination_id,
                        rating: rating,
                        review: review,
                        image: image,
                        video:video, // Thêm trường media (hình ảnh/video)
                    }
                },
                { upsert: true }
            );

            // Cập nhật lại rating của điểm đến
            const results = await Review.find({ destination_id: destination_id });
            const count = results.length;
            let total_rating = 0;

            // Tính tổng điểm rating
            results.forEach(element => {
                total_rating += element.rating;
            });

            // Tính điểm trung bình mới
            let new_avg = (total_rating / count).toFixed(1);

            // Cập nhật rating của destination
            await Destination.updateOne({ "_id": destination_id }, { "$set": { "rating": new_avg } });

            return res.status(200).json({
                type: "success",
                message: "Review added or updated successfully",
                data: {
                    modifiedCount: is_update.modifiedCount,
                    upsertedCount: is_update.upsertedCount
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                type: "error",
                message: "Something went wrong, please try again.",
            });
        }
    },
    async update_Review(req, res) {
        try {
            const user_id = req.user.id; // Lấy ID của người dùng từ thông tin đăng nhập
            const { destination_id, rating, review } = req.body;

            // Kiểm tra xem rating có hợp lệ không
            if (rating < 1 || rating > 5) {
                return res.status(422).json({
                    type: "validation_error",
                    message: "Rating must be between 1 and 5",
                });
            }

            // Cập nhật đánh giá
            const is_update = await Review.updateOne(
                { user_id: user_id, destination_id: destination_id },
                {
                    "$set": {
                        rating: rating,
                        review: review,
                    },
                }
            );

            if (is_update.matchedCount === 0) {
                return res.status(404).json({
                    type: "not_found",
                    message: "Review not found",
                });
            }

            // Tính lại trung bình đánh giá
            const reviews = await Review.find({ destination_id: destination_id });
            const count = reviews.length;
            const total_rating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const new_avg = (total_rating / count).toFixed(1);

            // Cập nhật trung bình đánh giá vào Destination
            await Destination.updateOne(
                { "_id": destination_id },
                { "$set": { "rating": new_avg } }
            );

            res.status(200).json({
                type: "success",
                message: "Review updated successfully",
                data: {
                    modifiedCount: is_update.modifiedCount,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                type: "server_error",
                message: "Something went wrong. Please try again later.",
            });
        }
    },
    async delete_rating(req, res) {
        try {
            const user_id = req.user.id; // Lấy ID của người dùng từ thông tin đăng nhập
            const { destination_id } = req.body;

            // Xóa đánh giá của người dùng cho điểm đến cụ thể
            const is_deleted = await Review.deleteOne({ user_id: user_id, destination_id: destination_id });

            // Kiểm tra xem đánh giá có tồn tại để xóa hay không
            if (is_deleted.deletedCount === 0) {
                return res.status(404).json({
                    type: "not_found",
                    message: "Review not found",
                });
            }

            // Lấy lại tất cả các đánh giá còn lại cho điểm đến
            const remaining_reviews = await Review.find({ destination_id: destination_id });
            const count = remaining_reviews.length;

            let new_avg;
            if (count > 0) {
                // Tính lại trung bình đánh giá nếu còn đánh giá
                const total_rating = remaining_reviews.reduce((sum, r) => sum + r.rating, 0);
                new_avg = (total_rating / count).toFixed(1);
            } else {
                // Không còn đánh giá nào, đặt trung bình đánh giá về 0
                new_avg = 0;
            }

            // Cập nhật trung bình đánh giá vào Destination
            await Destination.updateOne(
                { "_id": destination_id },
                { "$set": { "rating": new_avg } }
            );

            res.status(200).json({
                type: "success",
                message: "Review deleted successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                type: "server_error",
                message: "Something went wrong. Please try again later.",
            });
        }
    },
    async upload_Media(req, res) {
        try {
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    type: 'error',
                    message: 'No files were uploaded.',
                });
            }

            // Tạo URL cho các file đã tải lên
            const fileUrls = files.map(file => ({
                fileName: file.filename,
                url: `/uploads/${file.filename}`,
            }));

            res.status(200).json({
                type: 'success',
                message: 'Files uploaded successfully.',
                files: fileUrls,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                type: 'error',
                message: 'Something went wrong during the upload.',
            });
        }
    },

    // Get Media
    async getMedia(req, res) {
        try {
            const filename = req.params.filename;
            const filePath = path.join(__dirname, '../uploads', filename);

            // Kiểm tra file có tồn tại không
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    type: 'error',
                    message: 'File not found.',
                });
            }

            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                // Xử lý Partial Content cho video hoặc file lớn
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                if (start >= fileSize || end >= fileSize) {
                    return res.status(416).json({
                        type: 'error',
                        message: 'Requested range not satisfiable',
                    });
                }

                const chunkSize = end - start + 1;
                const fileStream = fs.createReadStream(filePath, { start, end });

                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': getContentType(filename),
                });

                fileStream.pipe(res);
            } else {
                // Gửi toàn bộ file
                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': getContentType(filename),
                    'Cache-Control': 'public, max-age=31536000',
                });

                fs.createReadStream(filePath).pipe(res);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({
                type: 'error',
                message: 'Something went wrong.',
            });
        }
    },

    // Helper để lấy MIME type dựa trên phần mở rộng file
    async getContentType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.mkv': 'video/x-matroska',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    },
}


module.exports = ReviewController