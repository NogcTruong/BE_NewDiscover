const mongoose = require('mongoose');
const mailSender = require('../utils/mail');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});
// Define a function to send emails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Email</title>
        <style>
          body {
            font-family: "Helvetica", "Arial", sans-serif;
            background: linear-gradient(135deg, #f3f4f6, #eaeaea);
            margin: 0;
            padding: 0;
            color: #444;
          }
          .email-container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #6a11cb, #2575fc);
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .content {
            padding: 25px 35px;
            text-align: center;
          }
          .content p {
            font-size: 16px;
            line-height: 1.8;
            margin: 15px 0;
          }
          .otp {
            display: inline-block;
            font-size: 28px;
            font-weight: bold;
            color: #2575fc;
            background: #f4f8ff;
            border: 2px solid #6a11cb;
            padding: 15px 40px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            font-size: 16px;
            color: #ffffff;
            background: linear-gradient(135deg, #6a11cb, #2575fc);
            border-radius: 8px;
            text-decoration: none;
            margin-top: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
          }
          .footer {
            font-size: 14px;
            color: #777;
            text-align: center;
            padding: 20px 10px;
            background-color: #f9f9f9;
            border-top: 1px solid #eeeeee;
          }
          .footer a {
            color: #2575fc;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            Email Verification
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up! Use the OTP code below to verify your email address:</p>
            <div class="otp">${otp}</div>
          </div>
          <div class="footer">
            &copy; 2024 Discover Viet Nam . All rights reserved.<br>
            <a href="https://yourwebsite.com/privacy">Privacy Policy</a> | <a href="https://yourwebsite.com/support">Support</a>
          </div>
        </div>
      </body>
      </html>`
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}
otpSchema.pre("save", async function (next) {
  console.log("New document saved to the database");
  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});
module.exports = mongoose.model("OTP", otpSchema);