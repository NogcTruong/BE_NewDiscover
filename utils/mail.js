const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {
    // Create a Transporter to send emails
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: "toanocchocute@gmail.com",
        pass: "hopc uyya qdgx fxkm",
      }
    });
    // Send emails to users
    let info = await transporter.sendMail({
      from: 'Discover VietNam',
      to: email,
      subject: title,
      html: body,
    });
    console.log("Email info: ", info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = mailSender;