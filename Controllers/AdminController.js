const Destination = require("../models/Destination");
const Users = require("../models/Users");
const getCoordinates = require('../utils/createCoordiante')




const AdminController = {

        async get_all_user(req, res, next) {
    
            try {
    
                const adminId = req.user.id;
                
                if(adminId) {  // check id of admin

                    const users = await Users.find({user_type: 'user'});

                    return res.status(200).json(users);

                } else {
                    res.status(400).json('Admin phải đăng nhập!')
                }
                
            } catch (error) {
                console.log(error);
            }
    
        },

        async delete_a_user(req, res, next) {

            try {
                
                const adminId = req.user.id;
                const userId = req.params.id;

                console.log(userId)

                const user = Users.findOne({_id: userId})

                if(adminId && user) {

                    await Users.deleteOne({_id: userId});

                    return res.status(200).json('Đã xoá thành công người dùng lày!')

                } else {
                    return res.status(400).json('Admin cần phải đăng nhập!');
                }

            } catch (error) {
                console.log(error);
            }

        },

        async add_destination(req, res, next) {
            const { name, category, price, description, place, rating, location, open_hours, close_hours, transportation,distance ,service, type } = req.body;
        
            const {lat, lon} = await getCoordinates(place);

            try {
                // Kiểm tra middleware đã thêm req.user hay chưa
                const adminId = req.user?.id;

                if (!adminId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
        
                const image_url = req.files.map(file => file.filename); // Đúng hơn: dùng req.files thay vì files

        
                // Tạo điểm đến mới
                const destination = await Destination.create({
                    name,
                    category,
                    price,
                    description,
                    place,
                    rating,
                    location,
                    open_hours,
                    close_hours,
                    transportation,
                    image_url,
                    distance,
                    service,
                    type,
                    lat,
                    lng: lon

                });
        
                await destination.save();
        
                return res.status(200).json(destination);
        
            } catch (error) {
                console.error("Error in add_destination:", error);
                return res.status(500).json({ message: "Server Error", error });
            }
        },

        async get_all_destination(req, res, next) {

            try {
                
                const allDestination = await Destination.find();

                if(allDestination) {

                    return res.status(200).json(allDestination);

                } else {

                    return res.status(400).json('Chưa có địa điểm nào!');

                }

            } catch (error) {
                console.log(error);
            }

        },

        async update_destination(req, res, next) {
            try {
                const destinationId = req.params.id; // Lấy ID từ params
                const { price, description, open_hours, close_hours, } = req.body; // Lấy dữ liệu từ body
        
                // Kiểm tra ID
                if (!destinationId) {
                    return res.status(400).json({ message: "Destination ID is required" });
                }
        
                // Tìm destination trong database
                const existingDestination = await Destination.findById(destinationId);
                if (!existingDestination) {
                    return res.status(404).json({ message: "Destination not found" });
                }
        
                // Lấy file ảnh (nếu có)
                const image_url = req.files ? req.files.map(file => file.filename) : existingDestination.image_url;
        
                // Cập nhật thông tin
                existingDestination.price = price || existingDestination.price;
                existingDestination.description = description || existingDestination.description;
                existingDestination.open_hours = open_hours || existingDestination.open_hours;
                existingDestination.close_hours = close_hours || existingDestination.close_hours;
                existingDestination.image_url = image_url;
                
        
                // Lưu thay đổi vào database
                await existingDestination.save();
        
                return res.status(200).json(existingDestination);
            } catch (error) {
                console.error("Error in update_destination:", error);
                return res.status(500).json({ message: "Server Error", error });
            }
        },

        async delete_destination(req, res, next) {

            try {

                const destinationId = req.params.id;

                const destination = await Destination.findByIdAndDelete(destinationId);

                if(destination) {

                    return res.status(200).json('Đã xoá thành công địa điểm này!');

                } else {
                    return res.status(400).json('Không tìm thấy địa điểm này!');
                }
                
            } catch (error) {
                console.log(error);
            }

        }
        
        

    
}

module.exports = AdminController;