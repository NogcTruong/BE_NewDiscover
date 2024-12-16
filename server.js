const express = require('express');
var cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const app = express();

app.use(cors())

/* configure body-parser */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb+srv://khang:khang123@discover.5xhr1.mongodb.net/?retryWrites=true&w=majority&appName=Discover", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

const { auth_route, user_route, review_router, destination_router, filters_router,otp_router, admin_router ,wishlistRoutes } = require('./routes');
const PlanController = require("./routes/Plan");
const chatbot_router = require("./routes/Chatbot");

app.use('/api/v1/auth', auth_route);
app.use('/api/v1/users', user_route);
app.use('/api/v1/review', review_router)
app.use('/api/v1/destination', destination_router)
app.use('/api/v1/filters',filters_router)
app.use('/api/v1/sendOtp',otp_router)
app.use('/api/v1/admin',admin_router)
app.use("/api/v1/plan", PlanController);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use("/api/v1/chatbot", chatbot_router);



app.listen(4000, () => {
    console.log("Server is listening on port 4000");
});
