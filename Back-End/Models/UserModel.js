// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  
  // Role Information
  role: {
    type: String,
    enum: ['rescuer', 'household_lead', 'brgy_captain', 'household_member'],
    required: [true, 'Role is required']
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);