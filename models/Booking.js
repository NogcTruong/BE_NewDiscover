const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    destination_id: {
        type: String,
        require: true,
    },
    destination: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    catetory: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    rating: {
        type: Number,
        require: true,
    },
    location: {
        type: String,
        require: true,
        unique: true,
    },
    open_hours: {
        type: String,
        require: true,
    },
    image_url: {
        type: String,
        require: true,
    },

})
module.exports = mongoose.model('Booking', BookingSchema);