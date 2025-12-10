const mongoose = require("mongoose");

const EvacuationSchema = new mongoose.Schema(
  {
    evacuationName: { type: String },
    barangay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barangay",
      required: true,
    },
    totalHouseholds: { type: Number, default: 0 },
    evacuationCapacity: { type: Number, required: true, default: 0 },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },
    contactPerson: {
      name: { type: String },
      contactNumber: { type: String },
      email: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for evacuation percentage (safe for zero capacity)
EvacuationSchema.virtual("evacuationPercentage").get(function () {
  if (this.evacuationCapacity > 0) {
    return (this.currentEvacuation / this.evacuationCapacity) * 100;
  }
  return 0; // or null if you prefer
});

// Virtual for available capacity (safe for zero capacity)
EvacuationSchema.virtual("availableCapacity").get(function () {
  return Math.max(this.evacuationCapacity - this.currentEvacuation, 0);
});

module.exports = mongoose.model("Evacuation", EvacuationSchema);
