// models/BarangayCaptain.js
const mongoose = require("mongoose");

const barangayCaptainSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // From your form
  idNumber: {
    type: String,
    required: [true, "Official ID number is required"],
    unique: true,
  },
  organization: {
    type: String,
    required: [true, "Contact person for emergency is required"],
  },

  // Barangay Information
  barangayName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },

  // Additional fields
  termStart: {
    type: Date,
  },
  termEnd: {
    type: Date,
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

module.exports = mongoose.model("BarangayCaptain", barangayCaptainSchema);
