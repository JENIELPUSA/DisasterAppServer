// models/HouseholdMember.js
const mongoose = require('mongoose');

const householdMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // From your form
  householdLeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HouseholdLead',
    required: [true, 'Household lead is required']
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: [
      'Spouse', 'Child', 'Son', 'Daughter', 'Parent', 'Father', 'Mother',
      'Sibling', 'Brother', 'Sister', 'Grandchild', 'Grandparent',
      'Relative', 'Cousin', 'Nephew/Niece', 'Uncle/Aunt', 
      'Other Family Member', 'Other'
    ]
  },
  
  // Household Information
  householdAddress: {
    type: String,
    required: [true, 'Household address is required']
  },
  householdLeadName: {
    type: String,
    required: [true, 'Household lead name is required']
  },
  
  // Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
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

module.exports = mongoose.model('HouseholdMember', householdMemberSchema);