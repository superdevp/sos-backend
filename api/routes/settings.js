const express = require("express");
const {
  changePassword,
  changeSOSEmail,
  getSettings
} = require("../controllers/settingsController");
const verifyToken = require("../middleware/auth");
const settings = express.Router();

settings.get("/get-settings", verifyToken, getSettings);
settings.post("/change-password", verifyToken, changePassword);
settings.post("/change-sos-email", verifyToken, changeSOSEmail);

module.exports = settings;