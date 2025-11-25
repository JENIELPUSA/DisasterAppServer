const mongoose = require("mongoose");

const EvacuationBarangaySchema = new mongoose.Schema({
  barangay: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay", 
    required: true 
  },
  evacuated: { type: Number, required: true },
  capacity: { type: Number, required: true }
});

const DamageBarangaySchema = new mongoose.Schema({
  barangay: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay", 
    required: true 
  },
  fullyDamaged: { type: Number, required: true },
  partiallyDamaged: { type: Number, required: true },
  totalHouses: { type: Number, required: true }
});

const CriticalRoadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["passable", "notPassable"], 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["Main Road", "Secondary Road", "Tertiary Road", "National Road"] 
  },
  reason: { type: String }
});

const RoadPassabilityBarangaySchema = new mongoose.Schema({
  barangay: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay", 
    required: true 
  },
  passable: { type: Number, required: true },
  notPassable: { type: Number, required: true },
  totalRoads: { type: Number, required: true },
  criticalRoads: [CriticalRoadSchema]
});

const ReliefItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }
});

const ReliefDistributionBarangaySchema = new mongoose.Schema({
  barangay: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Barangay", 
    required: true 
  },
  familiesServed: { type: Number, required: true },
  totalFamilies: { type: Number, required: true },
  reliefPacks: { type: Number, required: true },
  distributionStatus: { 
    type: String, 
    enum: ["pending", "in-progress", "completed"], 
    required: true 
  },
  lastDistribution: { type: Date },
  items: [ReliefItemSchema]
});

const AnalyticalReportSchema = new mongoose.Schema({
  reportDate: { type: Date, required: true, default: Date.now },
  reportPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  evacuationSummary: {
    totalEvacuated: { type: Number, required: true },
    barangays: [EvacuationBarangaySchema]
  },
  damageSummary: {
    totalHouses: { type: Number, required: true },
    fullyDamaged: { type: Number, required: true },
    partiallyDamaged: { type: Number, required: true },
    barangays: [DamageBarangaySchema]
  },
  roadPassability: {
    totalRoads: { type: Number, required: true },
    passable: { type: Number, required: true },
    notPassable: { type: Number, required: true },
    barangays: [RoadPassabilityBarangaySchema]
  },
  reliefDistribution: {
    totalFamiliesServed: { type: Number, required: true },
    totalReliefPacks: { type: Number, required: true },
    remainingPacks: { type: Number, required: true },
    distributionCenters: { type: Number, required: true },
    barangays: [ReliefDistributionBarangaySchema],
    reliefItems: [{
      name: { type: String, required: true },
      total: { type: Number, required: true },
      unit: { type: String, required: true },
      distributed: { type: Number, required: true }
    }]
  },
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index for better query performance
AnalyticalReportSchema.index({ reportDate: -1 });
AnalyticalReportSchema.index({ "reportPeriod.startDate": 1, "reportPeriod.endDate": 1 });

module.exports = mongoose.model("AnalyticalReport", AnalyticalReportSchema);