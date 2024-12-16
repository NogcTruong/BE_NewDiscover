const otpGenerator = require('otp-generator');
const OTP = require('../models/Otp');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');

const UserController = {

 

    /* get single user */
    async get_user(req, res) {
        try {
            const user = await User.findById(req.user.id);
            const { password, ...data } = user._doc;
            res.status(200).json({
                type: "success",
                data
            });

        } catch (err) {
            console.log(err)
            res.status(500).json({
                type: "error",
                message: "Something went wrong please try again",
                err
            })
        }
    },

   
    /* update user */
    async  update_user_details(req, res) {
        try {
          const { email, phone, password, otp } = req.body; // Lấy thông tin từ body request
          const updates = {};
      
          // Xử lý cập nhật password nếu có
          if (password) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
              return res.status(400).json({
                type: "error",
                message: "Password must include at least one uppercase letter, one number, and one special character.",
              });
            }
            updates.password = bcrypt.hashSync(password, 10);
          }
      
          // Xử lý cập nhật phone nếu có
          if (phone) updates.phone = phone;
      
          // Nếu email mới được cung cấp
          if (email) {
            // Kiểm tra xem email mới đã tồn tại chưa
            const emailExists = await User.findOne({ email });
            if (emailExists) {
              return res.status(400).json({
                type: "error",
                message: "Email already in use",
              });
            }
      
            // Nếu có OTP gửi kèm, xác thực OTP
            if (otp) {
              const validOTP = await OTP.findOne({ otp, email });
              if (!validOTP) {
                return res.status(400).json({
                  type: "error",
                  message: "Invalid or expired OTP",
                });
              }
      
              // Nếu OTP hợp lệ, thêm email vào danh sách cập nhật và xóa OTP
              updates.email = email;
              await OTP.deleteOne({ _id: validOTP._id });
            } else {
              // Nếu chưa có OTP, gửi OTP cho email mới
              const generatedOTP = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
              });
      
              // Lưu OTP vào cơ sở dữ liệu
              await OTP.create({ email, otp: generatedOTP });
      
              return res.status(200).json({
                type: "success",
                message: "OTP sent to new email. Please verify to update email.",
              });
            }
          }
      
          // Nếu không có gì để cập nhật
          if (Object.keys(updates).length === 0) {
            return res.status(400).json({
              type: "error",
              message: "No valid fields provided for update",
            });
          }
      
          // Thực hiện cập nhật thông tin user
          const updatedUser = await User.findByIdAndUpdate(
            req.user.id, // Lấy ID user từ params
            { $set: updates },
            { new: true } // Trả về user đã cập nhật
          );
      
          // Nếu user không tồn tại
          if (!updatedUser) {
            return res.status(404).json({
              type: "error",
              message: "User not found",
            });
          }
      
          // Trả về thông tin cập nhật thành công
          res.status(200).json({
            type: "success",
            message: "User details updated successfully",
            data: {
              id: updatedUser._id,
              username: updatedUser.username,
              email: updatedUser.email,
              phone: updatedUser.phone,
              user_type: updatedUser.user_type,
            },
          });
        } catch (err) {
          // Xử lý lỗi
          res.status(500).json({
            type: "error",
            message: "Something went wrong, please try again",
            error: err.message,
          });
        }
      },
    

    async  delete_user(req, res) {
        try {
          const userId = req.user.id;  // Lấy ID của người dùng từ request parameters
      
          // Kiểm tra xem người dùng có tồn tại không
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({
              type: "error",
              message: "User not found",
            });
          }
      
          // Xóa người dùng
          await User.findByIdAndDelete(userId);
      
          // Trả về thông báo thành công
          res.status(200).json({
            type: "success",
            message: "User deleted successfully",
          });
        } catch (err) {
          // Xử lý lỗi
          res.status(500).json({
            type: "error",
            message: "Something went wrong, please try again",
            error: err.message,
          });
        }
    },

}
      

module.exports = UserController;