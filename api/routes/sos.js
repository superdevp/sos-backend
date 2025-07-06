const express = require("express");
const {
  sendSOS,
} = require("../controllers/sosController");
const verifyToken = require("../middleware/auth");
const sos = express.Router();

sos.post("/send-sos", verifyToken, sendSOS);

module.exports = sos;