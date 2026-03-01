const IncidentReport = require("../Models/IncidentReportSchema");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const Notification = require("../Models/NotificationSchema");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const fileType = file.mimetype.startsWith("image") ? "image" : "video";
    cloudinary.uploader
      .upload_stream(
        { folder: "incident_reports", resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            uri: result.secure_url,
            publicId: result.public_id,
            type: fileType,
            fileName: file.originalname,
            duration: result.duration || 0,
          });
        }
      )
      .end(file.buffer);
  });
};

const deleteCloudinaryMedia = async (mediaArray = []) => {
  for (const item of mediaArray) {
    try {
      if (item.publicId) {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.type === "video" ? "video" : "image",
        });
      }
    } catch (err) {
      console.error("Cloudinary Delete Error:", err.message);
    }
  }
};

exports.createIncidentReport = async (req, res) => {
  try {
    const { location, details, type } = req.body;
    const parsedLoc =
      typeof location === "string" ? JSON.parse(location) : location;
    const parsedDetails =
      typeof details === "string" ? JSON.parse(details) : details;

    // ----------------------------
    // Handle uploaded files
    // ----------------------------
    const media = [];
    const mediaCount = { photos: 0, videos: 0 };

    if (req.files) {
      const allFiles = Object.values(req.files).flat();
      for (const file of allFiles) {
        const uploaded = await uploadToCloudinary(file);
        media.push(uploaded);
        uploaded.type === "image" ? mediaCount.photos++ : mediaCount.videos++;
      }
    }

    // ----------------------------
    // Map frontend values to enums
    // ----------------------------
    let finalSeverity = "medium"; // default enum: low|medium|high|major
    let finalWaterLevel = undefined;
    let finalLandslideType = undefined;
    let finalFireSeverity = undefined;
    let finalEarthquakeSeverity = undefined;
    let finalAccidentSeverity = undefined;

    // Determine specific severity based on report type
    switch (type) {
      case "flood":
        finalWaterLevel = parsedDetails.severity;
        // Map water level to generic severity
        if (["chest", "neck", "above_head"].includes(finalWaterLevel))
          finalSeverity = "major";
        else if (finalWaterLevel === "waist") finalSeverity = "high";
        else finalSeverity = "medium";
        break;

      case "landslide":
        finalLandslideType = parsedDetails.severity || "minor";
        // Map landslide type to generic severity
        if (finalLandslideType === "major") finalSeverity = "major";
        else if (finalLandslideType === "blocked" || finalLandslideType === "blocked_road") 
          finalSeverity = "high";
        else finalSeverity = "medium";
        break;

      case "fire":
        finalFireSeverity = parsedDetails.severity || "minor";
        // Map fire severity to generic severity
        if (finalFireSeverity === "major") finalSeverity = "major";
        else if (finalFireSeverity === "moderate") finalSeverity = "high";
        else finalSeverity = "medium";
        break;

      case "earthquake":
        finalEarthquakeSeverity = parsedDetails.severity || "weak";
        // Map earthquake intensity to generic severity
        if (finalEarthquakeSeverity === "very_strong") finalSeverity = "major";
        else if (finalEarthquakeSeverity === "strong") finalSeverity = "high";
        else if (finalEarthquakeSeverity === "moderate") finalSeverity = "medium";
        else finalSeverity = "low";
        break;

      case "accident":
        finalAccidentSeverity = parsedDetails.severity || "minor";
        // Map accident severity to generic severity
        if (finalAccidentSeverity === "fatal") finalSeverity = "major";
        else if (finalAccidentSeverity === "serious") finalSeverity = "high";
        else finalSeverity = "medium";
        break;

      default:
        // Fallback for unknown type
        finalSeverity = "medium";
    }

    // ----------------------------
    // Save Incident Report
    // ----------------------------
    const report = new IncidentReport({
      reportType: type,
      submitted: req.user?.linkId,
      barangayId: parsedDetails.barangayId,
      municipalityId: parsedDetails.municipalityId,
      address: parsedDetails.address,
      location: parsedLoc ? {
        latitude: parseFloat(parsedLoc.latitude),
        longitude: parseFloat(parsedLoc.longitude),
      } : undefined,
      // Specific severity fields
      waterLevel: finalWaterLevel,
      landslideType: finalLandslideType,
      fireSeverity: finalFireSeverity,
      earthquakeSeverity: finalEarthquakeSeverity,
      accidentSeverity: finalAccidentSeverity,
      // Generic severity
      severity: finalSeverity,
      description: parsedDetails.description,
      media,
      mediaCount,
    });

    await report.save();

    const io = req.app.get("io");
    for (const userId in global.connectedUsers) {
      const user = global.connectedUsers[userId];
      if (user.municipalityId === parsedDetails.municipalityId) {
        io.to(user.socketId).emit("incident:new", report);
      }
    }
    let notifTitle = "";
    let notifMessage = "";

    // Get the specific severity value for display
    const displaySeverity = 
      finalWaterLevel || 
      finalLandslideType || 
      finalFireSeverity || 
      finalEarthquakeSeverity || 
      finalAccidentSeverity || 
      finalSeverity;

    // Map report type to Filipino/English titles
    const typeLabels = {
      flood: "Baha",
      landslide: "Landslide",
      fire: "Sunog",
      earthquake: "Lindol",
      accident: "Aksidente"
    };

    const typeLabel = typeLabels[type] || type;

    notifTitle = `${typeLabel} Alert sa ${parsedDetails.address}`;
    notifMessage = `May naitalang ${typeLabel.toLowerCase()} sa ${parsedDetails.address}. Severity: ${displaySeverity}.`;

    const notification = new Notification({
      type,
      title: notifTitle,
      message: notifMessage,
      address: parsedDetails.address,
      location: parsedLoc ? {
        latitude: parseFloat(parsedLoc.latitude),
        longitude: parseFloat(parsedLoc.longitude),
      } : undefined,
      barangayId: parsedDetails.barangayId,
      municipalityId: parsedDetails.municipalityId,
      createdBy: req.user?._id,
      meta: {
        severity: finalSeverity,
        // Include all specific severities for flexibility
        waterLevel: finalWaterLevel,
        landslideType: finalLandslideType,
        fireSeverity: finalFireSeverity,
        earthquakeSeverity: finalEarthquakeSeverity,
        accidentSeverity: finalAccidentSeverity,
      },
    });

    await notification.save();

    // ----------------------------
    // Socket.io emit: notification (municipality-specific)
    // ----------------------------
    for (const userId in global.connectedUsers) {
      const user = global.connectedUsers[userId];
      if (user.municipalityId === parsedDetails.municipalityId) {
        io.to(user.socketId).emit("notification:new", notification);
      }
    }

    // ----------------------------
    // Respond to client
    // ----------------------------
    res.status(201).json({
      status: "success",
      data: { report, notification },
    });
  } catch (error) {
    console.error("ERROR creating incident report:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    // 1. Kunin ang municipalityId at i-convert sa ObjectId
    const userMunicipalityId = req.user.MunicipalityId;
    const linkId = req.user.linkId;

    if (!userMunicipalityId) {
      return res.status(403).json({
        status: "error",
        message: "No municipality ID found for this user.",
      });
    }

    // Convert string ID to MongoDB ObjectId
    const mId = new mongoose.Types.ObjectId(userMunicipalityId);

    // 2. Aggregation Pipeline
    const reports = await IncidentReport.aggregate([
      // STAGE 1: I-filter agad ang reports para sa munisipyo lang na ito
      { $match: { municipalityId: mId } },

      // STAGE 2: Lookup para sa Barangay details
      {
        $lookup: {
          from: "barangays", // Pangalan ng collection sa MongoDB
          localField: "barangayId",
          foreignField: "_id",
          as: "barangayDetails",
        },
      },

      // STAGE 3: Lookup para sa User/Submitter details
      {
        $lookup: {
          from: "userloginschemas", // Pangalan ng collection ng users
          localField: "submitted",
          foreignField: "_id",
          as: "userDetails",
        },
      },

      // STAGE 4: I-flatten ang arrays mula sa lookup (optional)
      {
        $unwind: { path: "$barangayDetails", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      // STAGE 6: Project (Pumili lang ng fields na gustong i-display)
      {
        $project: {
          "userDetails.password": 0, // Itago ang password para safe
          "userDetails.tokens": 0,
        },
      },
    ]);

    console.log(
      `DEBUG: Found ${reports.length} reports using Lookup for Municipality: ${userMunicipalityId}`
    );

    res.status(200).json({
      status: "success",
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("LOOKUP ERROR:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE
exports.deleteReport = async (req, res) => {
  try {
    const report = await IncidentReport.findOne({
      reportId: req.params.reportId,
    });
    if (!report) return res.status(404).json({ message: "Not found" });

    await deleteCloudinaryMedia(report.media);
    await report.deleteOne();
    res.status(200).json({ status: "success", message: "Deleted" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
