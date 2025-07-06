const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require('../utils/customErrors');

const JWT_SECRET = process.env.JWT_SECRET;
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Access denied. No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        name: decoded.username,
        email: decoded.email
      };

      next();
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = verifyToken;