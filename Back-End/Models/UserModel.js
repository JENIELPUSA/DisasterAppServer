// models/UserModel.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  profileInitials: { type: String, required: true },
  role: { type: String, required: true, default: "Registered Citizen" },
  barangay: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay", 
    required: true 
  },
  household: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Household" 
  },
  contactNumber: { type: String },
  email: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);