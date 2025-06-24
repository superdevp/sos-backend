const nodemailer = require("nodemailer");
const NODE_ENV = "development";

const EMAIL_FROM = process.env.EMAIL_FROM;
let transporter;

const initializeEmailService = async () => {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "superdevp@gmail.com",
      pass: "xtyq ivam agdy raic",
    },
  });


  try {
    await transporter.verify();
    console.log("Email service is ready to send messages");
  } catch (error) {
    console.error("Error verifying email service:", error);
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp, firstname = "") => {
  try {
    if (!transporter) {
      await initializeEmailService();
    }

    const greeting = firstname ? `Hello ${firstname},` : "Hello,";

    const mailOptions = {
      from: '"Deligo Team" <superdevp@gmail.com>',
      to: email,
      subject: "Your Registration OTP Code",
      text: `${greeting}\n\nYour OTP code for registration is: ${otp}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Your Registration OTP Code</h2>
          <p style="color: #666;">${greeting}</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${otp}</strong>
          </div>
          <p style="color: #666; text-align: center;">This code will expire in 10 minutes.</p>
          <p style="color: #666; text-align: center; margin-top: 30px; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp, name = "") => {
  try {
    if (!transporter) {
      await initializeEmailService();
    }

    const greeting = name ? `Hello ${name},` : "Hello,";

    const mailOptions = {
      from: EMAIL_FROM || '"Auth Service" <auth@example.com>',
      to: email,
      subject: "Password Reset Request",
      text: `${greeting}\n\nYour OTP code for password reset is: ${otp}. This code will expire in 10 minutes.\n\nIf you didn't request a password reset, please ignore this email or contact support if you have concerns.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="color: #666;">${greeting}</p>
          <p style="color: #666;">We received a request to reset your password. Use the following OTP code to continue:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${otp}</strong>
          </div>
          <p style="color: #666; text-align: center;">This code will expire in 10 minutes.</p>
          <p style="color: #666; margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p style="color: #666; text-align: center; margin-top: 30px; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail
}