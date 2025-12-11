const mongoose = require("mongoose");

const BarangaySchema = new mongoose.Schema(
  {
    barangayName: { type: String},
    municipality: { type: String, required: true }, // Added city
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    fullAddress:{ type: String},
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Barangay", BarangaySchema);
