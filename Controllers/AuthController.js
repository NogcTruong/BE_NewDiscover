const otpGenerator = require('otp-generator');
const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const api_config = require("../configs/api.js");


const OTP = require('../models/Otp');


const AuthController = {

  async sign_up(req, res, next) {
    try {
      const { username, email, phone, password, otp } = req.body;

      // Kiểm tra xem tất cả các trường đã được cung cấp chưa
      if (!username || !email || !password || !otp || !phone) {
        return res.status(403).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Kiểm tra độ mạnh của mật khẩu
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.",
        });
      }

      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingUser = await Users.findOne({ email, username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Tìm OTP gần nhất cho email
      const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
      if (response.length === 0 || otp !== response[0].otp) {
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        });
      }

      // Tạo người dùng mới
      const newUser = new Users({
        username,
        email,
        phone,
        user_type: "user",
        password: bcrypt.hashSync(password, 10), // Hash mật khẩu
      });
      const user = await newUser.save();

      // Trả về phản hồi thành công
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          user_type: user.user_type,
        },
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  },


  async login_user(req, res, next) {
    try {
      const { username, password } = req.body;

      // Kiểm tra xem người dùng có cung cấp username và password không
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Tìm người dùng theo username
      const user = await Users.findOne({ username });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }

      // Kiểm tra mật khẩu với hash đã lưu trong cơ sở dữ liệu
      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid password",
        });
      }

      // Kiểm tra mật khẩu có đáp ứng các yêu cầu không (chữ cái in hoa, số và ký tự đặc biệt)
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must include at least one uppercase letter, one number, and one special character.",
        });
      }

      // Tạo accessToken nếu mật khẩu hợp lệ
      const accessToken = jwt.sign(
        { id: user._id },
        api_config.api.jwt_secret,
        { expiresIn: "3d" }
      );

      // Trả về thông tin người dùng và token
      const { password: userPassword, ...data } = user._doc;

      res.status(200).json({
        success: true,
        message: "Successfully logged in",
        data,
        accessToken,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while logging in",
        error: error.message,
      });
    }
  },

  async reset_password(req, res, next) {
    try {
      const { email } = req.body;

      // Kiểm tra xem email có tồn tại trong hệ thống không
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({
          type: "error",
          message: "Email not found",
        });
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      let newPassword = "";

      while (true) {
        // Tạo mật khẩu ngẫu nhiên
        newPassword = otpGenerator.generate(10, {
          upperCaseAlphabets: true,
          lowerCaseAlphabets: true,
          digits: true,
          specialChars: true,
        });

        // Kiểm tra xem mật khẩu có hợp lệ không
        if (passwordRegex.test(newPassword)) {
          break;
        }
      }
      // Hash mật khẩu trước khi lưu
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      // Cập nhật mật khẩu trong cơ sở dữ liệu
      user.password = hashedPassword;
      await user.save();

      // Cấu hình và gửi email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
          user: "toanocchocute@gmail.com",
          pass: "hopc uyya qdgx fxkm",
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Password Reset Request",
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
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
          .password {
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
            Password Reset
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your password has been successfully reset. Please use the new password below to log in:</p>
            <div class="password">${newPassword}</div>
            <p>We recommend changing this password after logging in to ensure your account's security.</p>
          </div>
          <div class="footer">
            &copy; 2024 Discover Viet Nam. All rights reserved.<br>
            <a href="https://yourwebsite.com/privacy">Privacy Policy</a> | <a href="https://yourwebsite.com/support">Support</a>
          </div>
        </div>
      </body>
      </html>
    `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            type: "error",
            message: "Failed to send email",
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            type: "success",
            message: "New password sent to your email",
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        type: "error",
        message: "Something went wrong",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;