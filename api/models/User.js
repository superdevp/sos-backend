const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'First Name is required'],
    trim: true,
    maxlength: [30, 'First Name cannot exceed 30 characters']
  },
  lastname: {
    type: String,
    required: [true, 'Last Name is required'],
    trim: true,
    maxlength: [30, 'Last Name cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
  },
  gender: {
    type: String,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }],
  apiKeys: [{
    key: String,
    name: String,
    createdAt: Date,
    lastUsed: Date,
    permissions: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateRefreshToken = function() {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  this.refreshTokens.push({
    token: refreshToken,
    expiresAt
  });
  
  return {
    token: refreshToken,
    expiresAt
  };
};

userSchema.methods.generateApiKey = function(name, permissions = ['read']) {
  const apiKey = `ak_${crypto.randomBytes(24).toString('hex')}`;
  
  this.apiKeys.push({
    key: apiKey,
    name,
    createdAt: new Date(),
    lastUsed: null,
    permissions
  });
  
  return apiKey;
};

const User = mongoose.model('User', userSchema);

module.exports = User;