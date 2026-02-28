const mongoose = require("mongoose");

const TrackingSchema = new mongoose.Schema(
  {
    evacuationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evacuation",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLoginSchema",
      required: true,
    },
    municipality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLoginSchema",
      required: true,
    },
    scanType: {
      type: String,
      enum: ["check_in", "check_out"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Tracking", TrackingSchema);
