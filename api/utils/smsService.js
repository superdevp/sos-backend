const { Vonage } = require('@vonage/server-sdk')
require("dotenv").config();

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
})


const sendSMS = async (to, otp, firstname = "") => {
    const greeting = firstname ? `Hello ${firstname},` : "Hello,";
    const mailText  = `${greeting}\n\nYour OTP code for registration is: ${otp}. This code will expire in 10 minutes.`;
    const response = await vonage.sms.send({to, from: "SOS support", text: mailText})
    return response;
}

module.exports = {
    sendSMS
}