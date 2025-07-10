const express = require("express");
const {
  sendSOS,
  getAllSOSRequests,
  getUserSOSRequests,
  getSOSRequest,
  updateSOSStatus,
  getSOSStatistics
} = require("../controllers/sosController");
const verifyToken = require("../middleware/auth");
const sos = express.Router();

// Send SOS request
sos.post("/send-sos", verifyToken, sendSOS);

// Admin routes
sos.get("/admin/all", verifyToken, getAllSOSRequests);
sos.get("/admin/statistics", verifyToken, getSOSStatistics);
sos.get("/admin/:sosId", verifyToken, getSOSRequest);
sos.put("/admin/:sosId/status", verifyToken, updateSOSStatus);

// User routes
sos.get("/my", verifyToken, getUserSOSRequests);
sos.get("/:sosId", verifyToken, getSOSRequest);

module.exports = sos;