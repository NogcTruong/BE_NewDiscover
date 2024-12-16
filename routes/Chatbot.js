const express = require("express");
const router = express.Router();
const ChatbotController = require("../Controllers/ChatbotController");
const { authenticationVerifier } = require("../Middlewares/VerifyToken");

router.post("/get-answer", authenticationVerifier, ChatbotController.generateResponse);

module.exports = router;
