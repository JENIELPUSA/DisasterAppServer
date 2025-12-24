const mongoose = require("mongoose");

const HouseholdSchema = new mongoose.Schema({
  householdHead: { type: String, required: true },
  address: { type: String, required: true },
  familyMembers: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Registered", "Evacuated", "Needs Assistance"], 
    default: "Registered" 
  },
  registrationDate: { type: Date, default: Date.now },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number }
  },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    contactNumber: { type: String }
  },
  specialNeeds: [{ type: String }], 
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

HouseholdSchema.index({ barangay: 1, status: 1 });
HouseholdSchema.index({ householdHead: 'text', address: 'text' });

module.exports = mongoose.model("Household", HouseholdSchema);