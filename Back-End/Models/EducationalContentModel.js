const mongoose = require("mongoose");

const EducationalContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      "preparedness",
      "evacuation", 
      "community", 
      "prevention", 
      "safety",
      "health"
    ] 
  },
  priority: { type: Number, default: 0 },
  targetAudience: [{ type: String }], // e.g., ["All", "Household Head", "PWD"]
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("EducationalContent", EducationalContentSchema);