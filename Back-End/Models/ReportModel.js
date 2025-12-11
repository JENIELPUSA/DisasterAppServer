// models/ReportModel.js
const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
  uri: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["image", "video"], 
    required: true 
  },
  duration: { type: Number }, // For videos
  thumbnail: { type: String } // For videos
});

const ReportSchema = new mongoose.Schema({
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  barangay: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay", 
    required: true 
  },
  household: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Household" 
  },
  type: { 
    type: String, 
    enum: ["nasirang-bahay", "baha"], 
    required: true 
  },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ["low", "medium", "high"], 
    default: "medium" 
  },
  address: { type: String, required: true },
  media: [MediaSchema],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number }
  },
  ipAddress: { type: String },
  status: { 
    type: String, 
    enum: ["pending", "verified", "in-progress", "resolved"], 
    default: "pending" 
  },
  // Common fields for both report types
  emergencyNeeded: { type: Boolean, default: false },
  roadClosed: { type: Boolean, default: false },
  // Specific fields for Nasirang Bahay
  damageType: { 
    type: String, 
    enum: [
      "Roof Damage", 
      "Wall Collapse", 
      "Foundation", 
      "Flood Damage", 
      "Fire Damage", 
      "Other"
    ] 
  },
  // Specific fields for Baha
  waterLevel: { 
    type: String, 
    enum: [
      "Ankle-deep",
      "Knee-deep", 
      "Waist-deep", 
      "Chest-deep", 
      "Neck-deep", 
      "Above Head"
    ] 
  },
  assignedTeam: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ResponseTeam" 
  },
  resolutionNotes: { type: String },
  resolvedAt: { type: Date }
}, {
  timestamps: true,
  discriminatorKey: 'type'
});

// Index for better query performance
ReportSchema.index({ barangay: 1, type: 1, status: 1 });
ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Report", ReportSchema);