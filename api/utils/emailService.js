const nodemailer = require("nodemailer");
const NODE_ENV = "development";

const EMAIL_FROM = process.env.EMAIL_FROM;
let transporter;

const initializeEmailService = async () => {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "superdevp@gmail.com",
      pass: "zgas mvts swxw aqel",
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
      from: 'superdevp@gmail.com',
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
      from: 'superdevp@gmail.com',
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

// Send SOS email
const sendSOSEmail = async (email, address, name = "", user_email = "") => {
  try {
    if (!transporter) {
      await initializeEmailService();
    }

    const mailOptions = {
      from: 'superdevp@gmail.com',
      to: email,
      subject: "SOS Request",
      text: `Dear [Recipient's Name],

              ${name} is in urgent need of assistance. Please find their current details below:

              - Location: ${address}
              - **Contact Information**: ${user_email}

              Please respond as soon as possible. Your prompt help is greatly appreciated.

              Thank you.

              Sincerely
              SOS Team`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SOS Email</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    font-size: 24px;
                    font-weight: bold;
                    color: #d9534f;
                }
                .details {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">SOS: Immediate Assistance Required</div>
                <div class="details">
                    <p>Hello,</p>
                    <p>${name} is in urgent need of assistance. Please find their current details below:</p>
                    <ul>
                        <li><strong>Location:</strong> ${address}</li>
                        <li><strong>Contact Information:</strong> ${user_email}</li>
                    </ul>
                    <p>Please respond as soon as possible. Your prompt help is greatly appreciated.</p>
                    <p>Thank you.</p>
                    <p>Sincerely,<br>SOS team</p>
                </div>
            </div>
        </body>
        </html>
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
  sendPasswordResetEmail,
  sendSOSEmail
}