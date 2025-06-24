const crypto = require('crypto');

const generateOTP = (length = 5) => {
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  
  return OTP;
};

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp.toString()).digest('hex');
};

const verifyOTP = (providedOTP, hashedOTP) => {
  const hashedProvidedOTP = hashOTP(providedOTP);
  return hashedProvidedOTP === hashedOTP;
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP
};