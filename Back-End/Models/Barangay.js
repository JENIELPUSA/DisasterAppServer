const mongoose = require("mongoose");

const BarangaySchema = new mongoose.Schema(
  {
    barangayName: { type: String },
    municipality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Municipality",
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    fullAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Barangay", BarangaySchema);
