const mongoose = require("mongoose");

const ResponseTeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barangay: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay", 
    required: true 
  },
  teamLeader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  contactNumber: { type: String, required: true },
  specialization: [{ 
    type: String, 
    enum: [
      "Rescue", 
      "Medical", 
      "Engineering", 
      "Relief", 
      "Coordination"
    ] 
  }],
  vehicles: [{
    type: { type: String },
    plateNumber: { type: String },
    capacity: { type: Number }
  }],
  isActive: { type: Boolean, default: true },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    lastUpdated: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ResponseTeam", ResponseTeamSchema);