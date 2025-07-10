const User = require("../models/User");
const { ForbiddenError, NotFoundError, BadRequestError } = require("../utils/customErrors");
const { db, bucket } = require('../config/firebaseAdmin');
const { refreshToken } = require("firebase-admin/app");

const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Not authorized to access this resource");
    }

    const users = await User.find({ role: "user" }).select("-password");
    const data = users.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      age: user.age,
      gender: user.gender,
      address: user.address,
      role: user.role,
      avatar: user.avatar,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      // Activity tracking data
      sosActivities: user.sosActivities || [],
      loginActivities: user.loginActivities || [],
      // Activity counts for quick reference
      sosActivitiesCount: user.sosActivities ? user.sosActivities.length : 0,
      loginActivitiesCount: user.loginActivities ? user.loginActivities.length : 0,
      // API keys (without sensitive data)
      apiKeys: user.apiKeys ? user.apiKeys.map(key => ({
        name: key.name,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        permissions: key.permissions
      })) : [],
      apiKeysCount: user.apiKeys ? user.apiKeys.length : 0,
      refreshTokens: user.refreshTokens || [],
      // Timestamps
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({
      success: true,
      users: data,
      total: data.length,
      summary: {
        totalUsers: data.length,
        totalSOSActivities: data.reduce((sum, user) => sum + user.sosActivitiesCount, 0),
        totalLoginActivities: data.reduce((sum, user) => sum + user.loginActivitiesCount, 0),
        totalApiKeys: data.reduce((sum, user) => sum + user.apiKeysCount, 0)
      }
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

    const drivers = await User.find({ role: "driver" }).select("-password");

    const data = drivers.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      age: user.age,
      gender: user.gender,
      address: user.address,
      role: user.role,
      avatar: user.avatar,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      // Activity tracking data
      sosActivities: user.sosActivities || [],
      loginActivities: user.loginActivities || [],
      // Activity counts for quick reference
      sosActivitiesCount: user.sosActivities ? user.sosActivities.length : 0,
      loginActivitiesCount: user.loginActivities ? user.loginActivities.length : 0,
      // API keys (without sensitive data)
      apiKeys: user.apiKeys ? user.apiKeys.map(key => ({
        name: key.name,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        permissions: key.permissions
      })) : [],
      apiKeysCount: user.apiKeys ? user.apiKeys.length : 0,
      refreshTokens: user.refreshTokens || [],
      // Timestamps
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({
      success: true,
      drivers: data,
      total: data.length,
      summary: {
        totalDrivers: data.length,
        totalSOSActivities: data.reduce((sum, user) => sum + user.sosActivitiesCount, 0),
        totalLoginActivities: data.reduce((sum, user) => sum + user.loginActivitiesCount, 0),
        totalApiKeys: data.reduce((sum, user) => sum + user.apiKeysCount, 0)
      }
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

    const users = await User.find({ role: "user" }).select("-password");

    const data = users.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      age: user.age,
      gender: user.gender,
      address: user.address,
      role: user.role,
      avatar: user.avatar,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      // Activity tracking data
      sosActivities: user.sosActivities || [],
      loginActivities: user.loginActivities || [],
      // Activity counts for quick reference
      sosActivitiesCount: user.sosActivities ? user.sosActivities.length : 0,
      loginActivitiesCount: user.loginActivities ? user.loginActivities.length : 0,
      // API keys (without sensitive data)
      apiKeys: user.apiKeys ? user.apiKeys.map(key => ({
        name: key.name,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        permissions: key.permissions
      })) : [],
      apiKeysCount: user.apiKeys ? user.apiKeys.length : 0,
      refreshTokens: user.refreshTokens || [],
      // Timestamps
      lastLogin: user.lastLogin,
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

    const users = await User.find({ role: "driver" }).select("-password");

    const data = users.map((user, index) => ({
      _id: user._id,
      id: index + 1,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      age: user.age,
      gender: user.gender,
      address: user.address,
      role: user.role,
      avatar: user.avatar,
      phonecode: user.phonecode,
      phonenumber: user.phonenumber,
      lat: user.lat,
      lng: user.lng,
      status: user.status,
      // Activity tracking data
      sosActivities: user.sosActivities || [],
      loginActivities: user.loginActivities || [],
      // Activity counts for quick reference
      sosActivitiesCount: user.sosActivities ? user.sosActivities.length : 0,
      loginActivitiesCount: user.loginActivities ? user.loginActivities.length : 0,
      // API keys (without sensitive data)
      apiKeys: user.apiKeys ? user.apiKeys.map(key => ({
        name: key.name,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        permissions: key.permissions
      })) : [],
      apiKeysCount: user.apiKeys ? user.apiKeys.length : 0,
      refreshTokens: user.refreshTokens || [],
      // Timestamps
      lastLogin: user.lastLogin,
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

// Get user's SOS activities
const getUserSOSActivities = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Sort by timestamp (newest first)
    const sosActivities = user.sosActivities.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      sosActivities: sosActivities,
      total: sosActivities.length
    });
  } catch (error) {
    next(error);
  }
};

// Get user's login activities
const getUserLoginActivities = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Sort by timestamp (newest first)
    const loginActivities = user.loginActivities.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      loginActivities: loginActivities,
      total: loginActivities.length
    });
  } catch (error) {
    next(error);
  }
};

// Get all SOS activities (admin only)
const getAllSOSActivities = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Not authorized to access this resource");
    }

    const users = await User.find({}).select('firstname lastname email sosActivities');
    const allSOSActivities = [];

    users.forEach(user => {
      user.sosActivities.forEach(activity => {
        allSOSActivities.push({
          userId: user._id,
          userName: `${user.firstname} ${user.lastname}`,
          userEmail: user.email,
          ...activity.toObject()
        });
      });
    });

    // Sort by timestamp (newest first)
    allSOSActivities.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      sosActivities: allSOSActivities,
      total: allSOSActivities.length
    });
  } catch (error) {
    next(error);
  }
};

// Get all login activities (admin only)
const getAllLoginActivities = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Not authorized to access this resource");
    }

    const users = await User.find({}).select('firstname lastname email loginActivities');
    const allLoginActivities = [];

    users.forEach(user => {
      user.loginActivities.forEach(activity => {
        allLoginActivities.push({
          userId: user._id,
          userName: `${user.firstname} ${user.lastname}`,
          userEmail: user.email,
          ...activity.toObject()
        });
      });
    });

    // Sort by timestamp (newest first)
    allLoginActivities.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      loginActivities: allLoginActivities,
      total: allLoginActivities.length
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account (admin only)
const deleteUserAccount = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Not authorized to access this resource");
    }

    const { userId } = req.params;

    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      throw new BadRequestError("Cannot delete your own account");
    }

    // Prevent admin from deleting other admins
    if (user.role === "admin") {
      throw new BadRequestError("Cannot delete admin accounts");
    }

    // Delete user's avatar from Firebase if exists
    if (user.avatar) {
      try {
        const avatarPath = user.avatar.split('/').pop(); // Extract filename
        const fileRef = bucket.file(`avatars/${avatarPath}`);
        await fileRef.delete();
      } catch (error) {
        console.error("Error deleting avatar:", error);
        // Continue with user deletion even if avatar deletion fails
      }
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User account deleted successfully",
      deletedUser: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete multiple user accounts (admin only)
const deleteMultipleUserAccounts = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Not authorized to access this resource");
    }

    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestError("User IDs array is required");
    }

    // Check if any of the IDs are the current admin's ID
    if (userIds.includes(req.user.userId)) {
      throw new BadRequestError("Cannot delete your own account");
    }

    // Find all users to be deleted
    const usersToDelete = await User.find({ _id: { $in: userIds } });

    if (usersToDelete.length === 0) {
      throw new NotFoundError("No users found to delete");
    }

    // Check for admin accounts
    const adminUsers = usersToDelete.filter(user => user.role === "admin");
    if (adminUsers.length > 0) {
      throw new BadRequestError("Cannot delete admin accounts");
    }

    const deletedUsers = [];

    // Delete each user and their avatar
    for (const user of usersToDelete) {
      // Delete user's avatar from Firebase if exists
      if (user.avatar) {
        try {
          const avatarPath = user.avatar.split('/').pop();
          const fileRef = bucket.file(`avatars/${avatarPath}`);
          await fileRef.delete();
        } catch (error) {
          console.error("Error deleting avatar:", error);
        }
      }

      deletedUsers.push({
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      });
    }

    // Delete all users
    await User.deleteMany({ _id: { $in: userIds } });

    res.json({
      success: true,
      message: `${deletedUsers.length} user account(s) deleted successfully`,
      deletedUsers: deletedUsers,
      totalDeleted: deletedUsers.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllDrivers,
  addUser,
  addDriver,
  getUserSOSActivities,
  getUserLoginActivities,
  getAllSOSActivities,
  getAllLoginActivities,
  deleteUserAccount,
  deleteMultipleUserAccounts
};