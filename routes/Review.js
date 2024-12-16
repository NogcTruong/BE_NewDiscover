const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { accessLevelVerifier, isAdminVerifier, authenticationVerifier } = require('../Middlewares/VerifyToken');
const { ReviewController } = require('../Controllers');

router.post('/add', authenticationVerifier, ReviewController.create_review);
router.put('/update',authenticationVerifier,ReviewController.update_Review);
router.delete('/delete',authenticationVerifier,ReviewController.delete_rating);
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Thư mục lưu trữ file
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mkv'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and MP4/MKV are allowed.'));
    }
};

const upload = multer({ storage, fileFilter });

// Route Upload Media
router.post('/upload', upload.array('files', 10),ReviewController.upload_Media);

// Route Get Media
router.get('/media/:filename', ReviewController.getMedia);


module.exports = router;