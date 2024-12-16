const AuthController = require('./AuthController');
const UserController = require('./UsersController.js');
const ReviewController = require('./ReviewController.js');
const DestinationController = require("./DestinationController.js")
const FiltersController = require("./FiltersController.js")
const AdminController = require('./AdminController.js');
const WishlistController = require("./wishlistController.js")


module.exports = {
    AuthController,
    UserController,
    ReviewController,
    DestinationController,
    FiltersController,
    AdminController,
    WishlistController
}