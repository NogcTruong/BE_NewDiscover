const Wishlist = require('../models/Wishlist');

const WishlistController = {
    async addToWishlist(req, res) {
        try {
            const { user_id, destination_id } = req.body;
            const existingWishlistItem = await Wishlist.findOne({ user_id, destination_id });
    
            if (existingWishlistItem) {
                return res.status(400).json({ message: 'Destination already in wishlist.' });
            }
    
            const wishlistItem = new Wishlist({ user_id, destination_id });
            await wishlistItem.save();
            res.status(201).json({ message: 'Destination added to wishlist.', wishlistItem });
        } catch (error) {
            console.error('Error while adding to wishlist:', error);  // In lỗi chi tiết vào console
            res.status(500).json({ message: 'Error adding to wishlist.', error });
        }
    },

    async getWishlist(req, res) {
        try {
            const { user_id } = req.params;

            const wishlist = await Wishlist.find({ user_id }).populate('destination_id');
            res.status(200).json({ wishlist });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching wishlist.', error });
        }
    },
    // async getWishlist(req, res) {
    //     try {
    //         const { user_id } = req.params;
    //         const wishlist = await Wishlist.find({ user_id }).populate('destination_id');
    //         res.status(200).json({ wishlist: wishlist || [] }); // Luôn trả về mảng
    //     } catch (error) {
    //         res.status(500).json({ message: 'Error fetching wishlist.', error });
    //     }
    // },
    

    async removeFromWishlist(req, res) {
        try {
            const { user_id, destination_id } = req.body;

            const deletedItem = await Wishlist.findOneAndDelete({ user_id, destination_id });
            if (!deletedItem) {
                return res.status(404).json({ message: 'Destination not found in wishlist.' });
            }

            res.status(200).json({ message: 'Destination removed from wishlist.', deletedItem });
        } catch (error) {
            res.status(500).json({ message: 'Error removing from wishlist.', error });
        }
    }
    
};

module.exports = WishlistController;
