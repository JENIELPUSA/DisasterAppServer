// models/EducationalVideoModel.js
const mongoose = require("mongoose");

const EducationalVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  channel: { type: String, required: true },
  duration: { type: String, required: true },
  views: { type: String, required: true },
  uploadDate: { type: String, required: true },
  thumbnail: { type: String, required: true }, // URL or asset path
  videoUrl: { type: String }, // Actual video URL
  category: { 
    type: String, 
    required: true,
    enum: [
      "preparedness",
      "safety", 
      "evacuation", 
      "health", 
      "community"
    ] 
  },
  barangays: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay" 
  }],
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("EducationalVideo", EducationalVideoSchema);