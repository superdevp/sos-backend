const express = require("express");
const { getAllUsers } = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

const user = express.Router();

user.get("/", verifyToken, getAllUsers);

module.exports = user;
