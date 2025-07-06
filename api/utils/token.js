const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const generateAccessToken = (userId, username, role, email) => {
  return jwt.sign(
    { userId, username, role, email },
    JWT_SECRET,
    { expiresIn: "1d" } // Short-lived token
  );
};

// Generate refresh token
const generateRefreshToken = async (user) => {
  // Use the method from the User model
  const refreshToken = user.generateRefreshToken();
  await user.save();

  return refreshToken;
};

// Verify refresh token
const verifyRefreshToken = async (User, token) => {
  const user = await User.findOne({
    "refreshTokens.token": token,
    "refreshTokens.expiresAt": { $gt: new Date() },
  });

  if (!user) {
    return null;
  }

  return user;
};

// Remove expired refresh tokens
const removeExpiredTokens = async (User) => {
  const result = await User.updateMany(
    {},
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
  );

  return result;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  removeExpiredTokens
}