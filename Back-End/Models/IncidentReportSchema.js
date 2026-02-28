const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    uri: { type: String, required: true },
    publicId: { type: String }, // Importante para sa pag-delete sa Cloudinary
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    fileName: { type: String },
    duration: { type: Number },
  },
  { _id: false }
);

const IncidentReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true, index: true },
    reportType: {
      type: String,
      // 👇 PINALAWAK: idinagdag ang fire, earthquake, accident
      enum: ["flood", "landslide", "fire", "earthquake", "accident"],
      required: true,
      index: true,
    },
    submitted: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLoginSchema",
      required: true,
    },
    barangayId: { type: mongoose.Schema.Types.ObjectId, ref: "Barangay", required: true },
    municipalityId: { type: mongoose.Schema.Types.ObjectId, ref: "Municipality", required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "resolved", "rejected"],
      default: "pending",
    },
    address: { type: String, required: true, trim: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    
    // --- SPECIFIC SEVERITY FIELDS (para sa bawat report type) ---
    waterLevel: {
      type: String,
      enum: ["ankle", "knee", "waist", "chest", "neck", "above_head"],
      required: function () { return this.reportType === "flood"; },
    },
    landslideType: {
      type: String,
      enum: ["minor", "blocked", "blocked_road", "major"],
      required: function () { return this.reportType === "landslide"; },
    },
    // ✅ BAGONG FIELD PARA SA SUNOG
    fireSeverity: {
      type: String,
      enum: ["minor", "moderate", "major"],
      required: function () { return this.reportType === "fire"; },
    },
    // ✅ BAGONG FIELD PARA SA LINDOL
    earthquakeSeverity: {
      type: String,
      enum: ["weak", "moderate", "strong", "very_strong"],
      required: function () { return this.reportType === "earthquake"; },
    },
    // ✅ BAGONG FIELD PARA SA AKSIDENTE
    accidentSeverity: {
      type: String,
      enum: ["minor", "serious", "fatal"],
      required: function () { return this.reportType === "accident"; },
    },
    
    // --- GENERIC SEVERITY (awtomatikong sine-set batay sa specific field) ---
    severity: {
      type: String,
      enum: ["low", "medium", "high", "major", "minor", "moderate", "strong", "very_strong", "serious", "fatal"],
      required: true,
    },
    
    description: { type: String, maxlength: 1000 },
    media: [MediaSchema],
    mediaCount: {
      photos: { type: Number, default: 0 },
      videos: { type: Number, default: 0 },
    },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Pre-save hook para sa custom Report ID at pag-set ng generic severity
IncidentReportSchema.pre("save", function (next) {
  // 1. GENERATE REPORT ID kung wala pa
  if (!this.reportId) {
    let prefix;
    switch (this.reportType) {
      case "flood":
        prefix = "BF"; // Baha/Flood
        break;
      case "landslide":
        prefix = "LS"; // Landslide
        break;
      case "fire":
        prefix = "FR"; // Fire
        break;
      case "earthquake":
        prefix = "EQ"; // Earthquake
        break;
      case "accident":
        prefix = "AC"; // Accident
        break;
      default:
        prefix = "IR"; // Incident Report (fallback)
    }
    const timestamp = Date.now().toString().slice(-6);
    this.reportId = `${prefix}-${timestamp}`;
  }

  // 2. SET GENERIC SEVERITY batay sa specific field (kung walang manually set)
  if (!this.severity) {
    switch (this.reportType) {
      case "flood":
        const floodMap = {
          ankle: "low",
          knee: "medium",
          waist: "high",
          chest: "major",
          neck: "major",
          above_head: "major"
        };
        this.severity = floodMap[this.waterLevel] || "low";
        break;
        
      case "landslide":
        const landslideMap = {
          minor: "low",
          blocked: "medium",
          blocked_road: "medium",
          major: "major"
        };
        this.severity = landslideMap[this.landslideType] || "low";
        break;
        
      case "fire":
        const fireMap = {
          minor: "low",
          moderate: "medium",
          major: "high"
        };
        this.severity = fireMap[this.fireSeverity] || "low";
        break;
        
      case "earthquake":
        const earthquakeMap = {
          weak: "low",
          moderate: "medium",
          strong: "high",
          very_strong: "major"
        };
        this.severity = earthquakeMap[this.earthquakeSeverity] || "low";
        break;
        
      case "accident":
        const accidentMap = {
          minor: "low",
          serious: "high",
          fatal: "major"
        };
        this.severity = accidentMap[this.accidentSeverity] || "low";
        break;
        
      default:
        this.severity = "low";
    }
  }
  
  next();
});

module.exports = mongoose.model("IncidentReport", IncidentReportSchema);