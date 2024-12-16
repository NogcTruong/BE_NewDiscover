const express = require('express');
const router = express.Router();

const { AdminController } = require('../Controllers');
const { authenticationVerifier } = require('../Middlewares/VerifyToken');

const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Cấu hình nơi lưu trữ file
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '..', 'images'); // Đặt thư mục lưu file
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir); // Tạo thư mục nếu chưa tồn tại
        }
        cb(null, dir); // Lưu file vào thư mục
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '_' + file.originalname); // Tạo tên file
    }
});

// Middleware Multer: nhận file từ trường `image_url`
const image_url = multer({ storage: imageStorage }).array('image_url', 10);


//GET ALL USER
router.get('/all-users', authenticationVerifier, AdminController.get_all_user);

//DELETE AN USER
router.delete('/delete-user/:id', authenticationVerifier, AdminController.delete_a_user);

//ADD DESTINATION
router.post('/add-destination', authenticationVerifier, image_url, AdminController.add_destination);

//ADD DESTINATION
router.get('/all-destination', authenticationVerifier, AdminController.get_all_destination);

//UPDATE DESTINATION
router.put('/update-destination/:id', authenticationVerifier, image_url, AdminController.update_destination);

//DELETE DESTINATION
router.delete('/delete-destination/:id', authenticationVerifier, AdminController.delete_destination);



module.exports = router;