const express = require("express");
const {
  register,
  login,
  refreshToken,
  logout,
  verifyOTPAndRegister,
  resendOTPForRegister,
  getCurrentUser,
  removeAccount,
  requestPasswordReset,
  verifyPasswordResetOTP,
  resendPasswordResetOTP,
} = require("../controllers/authController");
const verifyToken = require("../middleware/auth");
const auth = express.Router();

auth.post("/register", register);
auth.post("/login", login);
auth.post("/refresh-token", refreshToken);
auth.post("/logout", logout);
auth.post("/verify-otp-and-register", verifyOTPAndRegister);
auth.post("/resend-otp-for-register", resendOTPForRegister);
auth.get("/validate", verifyToken, getCurrentUser);
auth.post("/remove-account", verifyToken, removeAccount);
auth.post("/request-password-reset", requestPasswordReset);
auth.post("/verify-password-reset-otp", verifyPasswordResetOTP);
auth.post("/resend-password-reset-otp", resendPasswordResetOTP);

module.exports = auth;