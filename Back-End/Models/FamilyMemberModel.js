// models/FamilyMemberModel.js
const mongoose = require("mongoose");

const FamilyMemberSchema = new mongoose.Schema({
  household: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Household", 
    required: true 
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  age: { type: Number, required: true },
  relationship: { 
    type: String, 
    required: true,
    enum: [
      "Household Head", 
      "Spouse", 
      "Child", 
      "Parent", 
      "Sibling", 
      "Grandparent", 
      "Other"
    ] 
  },
  contactNumber: { type: String },
  email: { type: String },
  birthDate: { type: Date },
  gender: { 
    type: String, 
    enum: ["Male", "Female", "Other"] 
  },
  isPWD: { type: Boolean, default: false },
  isSeniorCitizen: { type: Boolean, default: false },
  isPregnant: { type: Boolean, default: false },
  medicalConditions: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Virtual for full name
FamilyMemberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.middleName || ''} ${this.lastName}`.trim();
});

// Index for better query performance
FamilyMemberSchema.index({ household: 1 });
FamilyMemberSchema.index({ firstName: 'text', lastName: 'text' });

module.exports = mongoose.model("FamilyMember", FamilyMemberSchema);