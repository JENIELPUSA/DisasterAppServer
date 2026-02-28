const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  cost: { type: Number, required: false },
});

const NasirangBahayReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      default: () => `REP-${Date.now()}`, // Auto-generate kung wala sa payload
    },
    submitted: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLoginSchema",
      required: true,
    },
    typhoonName: { type: String, required: true }, // Mula sa "typhoonName": "Odette"
    damageType: { type: String, required: true }, // Mula sa "damageType": "roof_damage"
    damageTypeLabel: { type: String }, // Mula sa "damageTypeLabel": "Nasira ang Bubong"
    severity: { type: String, required: true }, // Mula sa "severity": "medium"
    severityLabel: { type: String }, // Mula sa "severityLabel": "Katamtaman"
    address: { type: String, required: true }, // Mula sa "address": "Giiba akf fimgdimg"
    description: { type: String }, // Mula sa "description"

    stillOccupied: { type: Boolean, default: false },
    emergencyNeeded: { type: Boolean, default: false },

    // Media sections (Inayos para sa 5-limit rule)
    beforeMedia: [
      {
        id: String,
        uri: String,
        type: { type: String, default: "image" },
        sequence: Number,
      },
    ],
    afterMedia: [
      {
        id: String,
        uri: String,
        type: { type: String, default: "image" },
        sequence: Number,
      },
    ],

    // Materials used for repair
    materialsUsed: [MaterialSchema],

    // Location & IP (Sakto sa payload structure)
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
    },
    ipAddress: { type: String },
    statusPost: {
      type: String,
      enum: ["after", "before"],
      default: "before",
    },
    // Metadata
    localTime: { type: String }, // Mula sa "localTime": "1/12/2026..."
    timestamp: { type: Date, default: Date.now },
    reportStatus: {
      type: String,
      enum: ["pending", "verified", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Upang maiwasan ang error sa duplicate "status" field,
// tinanggal ko yung isang 'status' at ginawang 'reportStatus'

module.exports = mongoose.model(
  "NasirangBahayReport",
  NasirangBahayReportSchema
);
