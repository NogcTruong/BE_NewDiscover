const express = require('express');
const WishlistController = require('../Controllers/wishlistController');
const router = express.Router();

router.post('/add', WishlistController.addToWishlist);
router.get('/:user_id', WishlistController.getWishlist);
router.delete('/remove', WishlistController.removeFromWishlist);

module.exports = router;
