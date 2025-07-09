const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
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
    minlength: [6, 'Password must be at least 6 characters long']
  },
  otp: {
    code: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;