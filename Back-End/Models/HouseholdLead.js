// models/HouseholdLead.js
const mongoose = require("mongoose");

const householdLeadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserLoginSchema",
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  familyMembers: {
    type: Number,
    required: [true, "Number of family members is required"],
    min: 1,
  },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },

  // Household Information
  householdCode: {
    type: String,
    unique: true,
  },
  totalMembers: {
    type: Number,
    default: 1, // Starts with 1 (the lead)
  },

  // Emergency Information
  emergencyContact: {
    type: String,
  },

  // Status
  isFull: {
    type: Boolean,
    default: false,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate household code before saving
householdLeadSchema.pre("save", function (next) {
  if (!this.householdCode) {
    // Generate a unique household code (e.g., HH-123456)
    this.householdCode =
      "HH-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("HouseholdLead", householdLeadSchema);
