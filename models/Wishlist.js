

const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    destination_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
        required: true,
    },
    added_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
