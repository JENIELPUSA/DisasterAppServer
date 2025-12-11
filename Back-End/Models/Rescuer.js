// models/Rescuer.js
const mongoose = require('mongoose');

const rescuerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // From your form
  organization: {
    type: String,
    required: [true, 'Organization is required']
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    unique: true
  },
  
  // Additional fields for rescuer functionality
  specialization: {
    type: String,
    enum: ['medical', 'fire', 'search_rescue', 'hazardous_materials', 'other'],
    default: 'other'
  },
  availability: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Rescuer', rescuerSchema);