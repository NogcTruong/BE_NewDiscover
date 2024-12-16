const auth_route = require('./Auth');
const user_route = require('./Users');
const review_router = require('./Review')
const destination_router = require('./Destination')
const filters_router = require('./Filters')
const otp_router = require('./Otp')
const admin_router = require('./Admin');
const wishlistRoutes = require('./Wishlist');

module.exports = {
    auth_route,
    user_route,
    review_router,
    destination_router,
    filters_router,
    otp_router,
    admin_router,
    wishlistRoutes
    
};