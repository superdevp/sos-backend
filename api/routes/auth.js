const express = require("express");
const {
  register,
  login,
  refreshToken,
  logout,
  verifyOTPAndRegister,
  resendOTPForRegister,
  getCurrentUser,
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

module.exports = auth;