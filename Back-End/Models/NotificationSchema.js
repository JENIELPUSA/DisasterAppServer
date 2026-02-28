const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["flood", "landslide", "fire", "earthquake", "accident"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    // Optional: kung may lugar na specific
    barangayId: { type: mongoose.Schema.Types.ObjectId, ref: "Barangay" },
    municipalityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Municipality",
    },
    address: {
      type: String,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserLoginSchema" }, // sino ang nag-create
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NotificationSchema", NotificationSchema);
