const mongoose = require("mongoose");

const BarangaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    city: { type: String, required: true }, // Added city
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Barangay", BarangaySchema);
