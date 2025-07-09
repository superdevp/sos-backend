const User = require("../models/User");
const TempUser = require("../models/TempUser");
const Setting = require("../models/Settings");
const {
  generateOTP,
  hashOTP,
  verifyOTP
} = require('../utils/otp');
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} = require('../utils/customErrors');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/token');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { sendSMS } = require("../utils/smsService");

const register = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      age,
      gender,
      address,
      email,
      password,
    } = req.body;

    // Validate required fields
    if (
      !firstname ||
      !lastname ||
      !age ||
      !gender ||
      !address ||
      !email ||
      !password
    ) {
      throw new BadRequestError("All fields are required");
    }

    // Check if user already exists in main users collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("User already exists with that email");
    }

    // Check if user exists in temp users collection
    const existingTempUser = await TempUser.findOne({ email });
    if (existingTempUser) {
      // Delete existing temp user
      await TempUser.deleteOne({ _id: existingTempUser._id });
    }

    // Generate OTP
    const otp = generateOTP(5);
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary user
    await TempUser.create({
      firstname,
      lastname,
      age,
      gender,
      address,
      email,
      password,
      otp: {
        code: hashedOTP,
        expiresAt: otpExpiry,
      },
    });

    // Send OTP email
    const isEmail = /^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email);
    const isPhoneNumber = /^\+?\d{10,15}$/.test(email);

    if(isPhoneNumber) {
      await sendSMS(email, otp, firstname);
    } else if(isEmail) {
      await sendOTPEmail(email, otp, firstname);
    } else {
      throw new BadRequestError("Invalid email address or phone number");
    }

    res.status(200).json({
      success: true,
      message:
        "Registration initiated. Please verify your email with the OTP sent.",
      email,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const accessToken = generateAccessToken(
      user._id,
      `${user.firstname} ${user.lastname}`,
      user.role,
      user.email
    );
    const refreshToken = await generateRefreshToken(user);

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        age: user.age,
        email: user.email,
        gender: user.gender,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    // Verify refresh token
    const user = await verifyRefreshToken(User, refreshToken);

    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refreshToken
    );

    const accessToken = generateAccessToken(user._id, user.username, user.role, user.email);
    const newRefreshToken = await generateRefreshToken(user);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken.token,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }
    const user = await User.findOne({ "refreshTokens.token": refreshToken });

    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
      await user.save({ validateBeforeSave: false });
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTPAndRegister = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new BadRequestError("Email and OTP are required");
    }

    // Find temporary user
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) {
      throw new NotFoundError("Registration request not found or expired");
    }

    // Check if OTP is expired
    if (tempUser.otp.expiresAt < new Date()) {
      await TempUser.deleteOne({ _id: tempUser._id });
      throw new BadRequestError("OTP has expired. Please register again.");
    }

    // Verify OTP
    if (!verifyOTP(otp, tempUser.otp.code)) {
      throw new BadRequestError("Invalid OTP");
    }

    // Create actual user
    const user = await User.create({
      firstname: tempUser.firstname,
      lastname: tempUser.lastname,
      email: tempUser.email,
      gender: tempUser.gender,
      age: tempUser.age,
      address: tempUser.address,
      password: tempUser.password,
    });

    // Delete temporary user
    await TempUser.deleteOne({ _id: tempUser._id });

    // Generate tokens
    const accessToken = generateAccessToken(
      user._id,
      `${user.firstname} ${user.lastname}`,
      user.role,
      user.email
    );
    const refreshToken = await generateRefreshToken(user);

    res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        age: user.age,
        gender: user.gender,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendOTPForRegister = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) {
      throw new NotFoundError("Registration request not found or expired");
    }

    const otp = generateOTP(5);
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    tempUser.otp = {
      code: hashedOTP,
      expiresAt: otpExpiry,
    };

    await tempUser.save();

    // Send OTP email
    const isEmail = /^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email);
    const isPhoneNumber = /^\+?\d{10,15}$/.test(email);

    if(isPhoneNumber) {
      await sendSMS(email, otp);
    } else if(isEmail) {
      await sendOTPEmail(email, otp);
    } else {
      throw new BadRequestError("Invalid email address or phone number");
    }

    res.json({
      success: true,
      message: "OTP resent successfully",
      email,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new UnauthorizedError("User not found or session expired");
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        address: user.address,
        gender: user.gender,
        age: user.age,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });

    await Setting.deleteOne({ userId: userId });

    await User.deleteOne({ _id: userId });

    res.json({
      success: true,
      message: "Account removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found with that email");
    }

    const otp = generateOTP(5);
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOTP = {
      code: hashedOTP,
      expiresAt: otpExpiry,
    };

    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(email, otp, user.firstname);

    res.json({
      success: true,
      message: "Password reset OTP sent to your email",
      email,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPasswordResetOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new BadRequestError("Email, OTP, and new password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.passwordResetOTP || !user.passwordResetOTP.code) {
      throw new BadRequestError("No password reset request found");
    }

    if (user.passwordResetOTP.expiresAt < new Date()) {
      user.passwordResetOTP = undefined;
      await user.save({ validateBeforeSave: false });
      throw new BadRequestError("OTP has expired. Please request a new one.");
    }

    if (!verifyOTP(otp, user.passwordResetOTP.code)) {
      throw new BadRequestError("Invalid OTP");
    }

    user.password = newPassword;
    user.passwordResetOTP = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

const resendPasswordResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found with that email");
    }

    const otp = generateOTP(5);
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOTP = {
      code: hashedOTP,
      expiresAt: otpExpiry,
    };

    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(email, otp, user.firstname);

    res.json({
      success: true,
      message: "Password reset OTP resent successfully",
      email,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  resendPasswordResetOTP
};
