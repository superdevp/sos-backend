const express = require("express");
const { 
  getAllUsers, 
  getUserSOSActivities, 
  getUserLoginActivities, 
  getAllSOSActivities, 
  getAllLoginActivities,
  deleteUserAccount,
  deleteMultipleUserAccounts
} = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

const user = express.Router();

// Admin routes
user.get("/", verifyToken, getAllUsers);
user.get("/sos-activities", verifyToken, getAllSOSActivities);
user.get("/login-activities", verifyToken, getAllLoginActivities);
user.delete("/:userId", verifyToken, deleteUserAccount);
user.delete("/bulk", verifyToken, deleteMultipleUserAccounts);

// User routes
user.get("/my/sos-activities", verifyToken, getUserSOSActivities);
user.get("/my/login-activities", verifyToken, getUserLoginActivities);

module.exports = user;
