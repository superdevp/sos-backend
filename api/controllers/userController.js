const User = require("../models/User");
const { ForbiddenError } = require("../utils/customErrors");
const { db, bucket } = require('../config/firebaseAdmin');

const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Not authorized to access this resource");
    }

    const users = await User.find({ role: "user" }).select("-password -refreshTokens");

    const data = users.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      gender: user.gender,
      address: user.address,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({
      success: true,
      users: data,
    });
  } catch (error) {
    next(error);
  }
};

const getAllDrivers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Not authorized to access this resource");
    }

    const drivers = await User.find({ role: "driver" }).select("-password -refreshTokens");

    const data = drivers.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      avatar: user.avatar,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      gender: user.gender,
      address: user.address,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({
      success: true,
      drivers: data,
    });
  } catch (error) {
    next(error);
  }
};

const addUser = async (req, res, next) => {
  const file = req.file;
  const { gender, firstName, lastName, email, password, code, phoneNumber, address, lat, lng } = req.body;
  if (!file) return res.status(400).send("No file uploaded.");
  if (!gender || !firstName || !lastName || !email || !password || !code || !phoneNumber || !address || !lat || !lng) return res.status(400).send("All fields are required.");
  const timestamp = Date.now();
  const originalExt = file.originalname.split('.').pop();
  const filename = `avatars/${timestamp}.${originalExt}`;
  const fileRef = bucket.file(filename);

  try {
    await fileRef.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("User already exists with that email");
    }
    await User.create({
      avatar: publicUrl,
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
      phonecode: code,
      phonenumber: phoneNumber,
      gender: gender,
      address: address,
      lat: lat,
      lng: lng,
      role: "user"
    });

    const users = await User.find({ role: "user" }).select("-password -refreshTokens");

    const data = users.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      avatar: user.avatar,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      gender: user.gender,
      address: user.address,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({
      success: true,
      users: data,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Upload failed.");
  }
};

const addDriver = async (req, res, next) => {
  const file = req.file;
  const { gender, firstName, lastName, email, password, code, phoneNumber, address, lat, lng } = req.body;
  if (!file) return res.status(400).send("No file uploaded.");
  if (!gender || !firstName || !lastName || !email || !password || !code || !phoneNumber || !address || !lat || !lng) return res.status(400).send("All fields are required.");
  const timestamp = Date.now();
  const originalExt = file.originalname.split('.').pop();
  const filename = `avatars/${timestamp}.${originalExt}`;
  const fileRef = bucket.file(filename);

  try {
    await fileRef.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("User already exists with that email");
    }
    await User.create({
      avatar: publicUrl,
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
      phonecode: code,
      phonenumber: phoneNumber,
      gender: gender,
      address: address,
      lat: lat,
      lng: lng,
      role: "driver"
    });

    const users = await User.find({ role: "driver" }).select("-password -refreshTokens");

    const data = users.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      avatar: user.avatar,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      gender: user.gender,
      address: user.address,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({
      success: true,
      drivers: data,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Upload failed.");
  }
};

module.exports = {
  getAllUsers,
  getAllDrivers,
  addUser,
  addDriver
};