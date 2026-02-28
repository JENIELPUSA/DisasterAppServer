const NasirangBahayReport = require("../Models/nasirangBahayReportSchema");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const path = require("path");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // for generating unique IDs for media

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- HELPER: Parallel Cloudinary Upload gamit ang Streamifier ---
const uploadToCloudinary = async (files, folder) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const uniqueFileName = `${Date.now()}_${baseName}`;

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          public_id: uniqueFileName,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  });

  const results = await Promise.all(uploadPromises);
  return results.map((res, index) => ({
    uri: res.secure_url,
    type: res.resource_type === "video" ? "video" : "image",
    fileName: files[index].originalname,
    id: res.public_id, // Importante para sa deletion
  }));
};

// --- 1. CREATE REPORT ---
exports.createReport = async (req, res) => {
  try {
    const {
      reportId,
      typhoonName,
      damageType,
      damageTypeLabel,
      severity,
      address,
      description,
      stillOccupied,
      needShelter,
      emergencyNeeded,
      materialsUsed,
      location,
      ipAddress,
    } = req.body;

    // Kunin ang linkId mula sa authenticated user
    const submitted = req.user?.linkId;

    // Parsing JSON fields
    const parsedLoc =
      typeof location === "string" ? JSON.parse(location) : location;
    const parsedMaterials =
      typeof materialsUsed === "string"
        ? JSON.parse(materialsUsed)
        : materialsUsed;

    // Parallel Upload
    let beforeMedia = [];
    if (req.files?.beforeMedia) {
      beforeMedia = await uploadToCloudinary(
        req.files.beforeMedia.slice(0, 5),
        "nasirang_bahay/before",
      );
    }

    const reportData = {
      reportId: reportId || `REP-${Date.now()}`,
      submitted, // <<< IDINAGDAG DITO PARA SA SCHEMA
      typhoonName,
      damageType,
      damageTypeLabel,
      severity,
      address,
      description,
      stillOccupied: stillOccupied === "true" || stillOccupied === true,
      needShelter: needShelter === "true" || needShelter === true,
      emergencyNeeded: emergencyNeeded === "true" || emergencyNeeded === true,
      beforeMedia,
      materialsUsed: parsedMaterials || [],
      location: {
        latitude: parseFloat(parsedLoc?.latitude),
        longitude: parseFloat(parsedLoc?.longitude),
        accuracy: parseFloat(parsedLoc?.accuracy) || 0,
      },
      ipAddress: ipAddress || req.ip,
      reportStatus: "pending",
    };

    // I-create ang report sa database
    const newReport = await NasirangBahayReport.create(reportData);

    res.status(201).json({ success: true, data: newReport });
  } catch (error) {
    console.error("Create Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- 2. UPDATE REPORT ---
exports.updateReport = async (req, res) => {
  try {
    const report = await NasirangBahayReport.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    // Handle afterMedia upload (Check limit total 5)
    if (req.files?.afterMedia) {
      const remainingSlots = 5 - (report.afterMedia?.length || 0);
      if (remainingSlots > 0) {
        const uploadedAfter = await uploadToCloudinary(
          req.files.afterMedia.slice(0, remainingSlots),
          "nasirang_bahay/after",
        );
        report.afterMedia.push(...uploadedAfter);
      }
    }

    // Update fields & Boolean conversion
    const fields = [
      "damageType",
      "damageTypeLabel",
      "severity",
      "address",
      "description",
      "reportStatus",
    ];
    const boolFields = ["stillOccupied", "needShelter", "emergencyNeeded"];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) report[f] = req.body[f];
    });
    boolFields.forEach((f) => {
      if (req.body[f] !== undefined)
        report[f] = req.body[f] === "true" || req.body[f] === true;
    });

    if (req.body.materialsUsed) {
      report.materialsUsed =
        typeof req.body.materialsUsed === "string"
          ? JSON.parse(req.body.materialsUsed)
          : req.body.materialsUsed;
    }

    await report.save();
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.SendAfterReport = async (req, res) => {
  try {
    const report = await NasirangBahayReport.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    let extractedData = {};

    if (req.body._parts && typeof req.body._parts === "string") {
      const rawString = req.body._parts;

      // Mas safe na paraan para makuha ang values sa pagitan ng specific keys
      const getPart = (key) => {
        const regex = new RegExp(
          `${key},(.*?)(?:,typhoonName|,statusPost|,totalRepairCost|,repairDate|,materialsUsed|,submissionDate|,reportId|,afterMedia|$)`,
        );
        const match = rawString.match(regex);
        return match ? match[1].trim() : null;
      };

      extractedData = {
        typhoonName: getPart("typhoonName"),
        statusPost: getPart("statusPost"),
        totalRepairCost: getPart("totalRepairCost"),
        repairDate: getPart("repairDate"),
        materialsUsed: getPart("materialsUsed"),
      };
    } else {
      extractedData = req.body;
    }

    const shouldUpdate = (val) =>
      val !== undefined && val !== null && val !== "" && val !== "null";

    // 1. UPDATE FIELDS
    if (shouldUpdate(extractedData.typhoonName))
      report.typhoonName = extractedData.typhoonName;
    if (shouldUpdate(extractedData.statusPost))
      report.statusPost = extractedData.statusPost;
    if (shouldUpdate(extractedData.totalRepairCost))
      report.totalRepairCost = extractedData.totalRepairCost;
    if (shouldUpdate(extractedData.repairDate))
      report.repairDate = extractedData.repairDate;

    // 2. MATERIALS USED (Clean Parsing)
    if (shouldUpdate(extractedData.materialsUsed)) {
      try {
        // Alisin ang trailing dots o maling characters kung meron
        let cleanJson = extractedData.materialsUsed;
        report.materialsUsed =
          typeof cleanJson === "string" ? JSON.parse(cleanJson) : cleanJson;
      } catch (e) {
        console.error(
          "Materials Parse Error:",
          e.message,
          "Data:",
          extractedData.materialsUsed,
        );
      }
    }

    // 3. MEDIA UPLOAD
    if (req.files?.afterMedia) {
      const uploaded = await uploadToCloudinary(
        req.files.afterMedia,
        "nasirang_bahay/after",
      );
      const formattedMedia = uploaded.map((file, index) => ({
        id: file.id,
        uri: file.uri,
        type: file.type || "image",
        sequence: (report.afterMedia?.length || 0) + index + 1,
      }));
      report.afterMedia.push(...formattedMedia);
      report.markModified("afterMedia");
    }

    await report.save();
    res.json({ success: true, message: "Updated successfully", data: report });
  } catch (error) {
    console.error("SendAfterReport Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- 3. GET ALL & SINGLE ---
exports.getReports = async (req, res) => {
  try {
    const reports = await NasirangBahayReport.find().sort({ timestamp: -1 });
    res
      .status(200)
      .json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. GET ALL & SINGLE (Reports by Logged-in User) ---
exports.getSpecificUploads = async (req, res) => {
  try {
    const userId = req.user.linkId;

    const reports = await NasirangBahayReport.find({
      submitted: userId,
    }).sort({ createdAt: -1 }); // mas ok kaysa timestamp

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getyphoonName = async (req, res) => {
  try {
    const submitted = new mongoose.Types.ObjectId(req.user.linkId);

    const reports = await NasirangBahayReport.aggregate([
      {
        $match: {
          submitted: submitted,
          $expr: {
            $not: {
              $and: [
                { $gt: [{ $size: "$beforeMedia" }, 0] },
                { $gt: [{ $size: "$afterMedia" }, 0] },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$typhoonName",
          reportObjectId: { $first: "$_id" },
          reportId: { $first: "$reportId" },
          statusPost: { $first: "$statusPost" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$reportObjectId",
          reportId: 1,
          typhoonName: "$_id",
          statusPost: 1,
        },
      },
      {
        $sort: { typhoonName: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await NasirangBahayReport.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. DELETE REPORT (With Cloudinary Cleanup) ---
exports.deleteReport = async (req, res) => {
  try {
    const report = await NasirangBahayReport.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    // Ipunin lahat ng media IDs
    const allMedia = [
      ...(report.beforeMedia || []),
      ...(report.afterMedia || []),
    ];
    const deletePromises = allMedia.map((item) =>
      item.id ? cloudinary.uploader.destroy(item.id) : null,
    );

    await Promise.all(deletePromises);
    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report and media deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.DisplayAllNasirangBahay = async (req, res) => {
  try {
    const { search, typhoon, municipality, barangay } = req.query;

    const matchFilter = {};

    // 🔹 Specific Filters
    if (typhoon)
      matchFilter.typhoonName = { $regex: typhoon, $options: "i" };

    if (municipality)
      matchFilter["municipality.municipalityName"] = {
        $regex: municipality,
        $options: "i",
      };

    if (barangay)
      matchFilter.barangay = { $regex: barangay, $options: "i" };

    // 🔥 GLOBAL SEARCH
    if (search && search.trim() !== "") {
      matchFilter.$or = [
        { typhoonName: { $regex: search, $options: "i" } },
        { "submittedUser.fullName": { $regex: search, $options: "i" } },
        { "submittedUser.username": { $regex: search, $options: "i" } },
        { "municipality.municipalityName": { $regex: search, $options: "i" } },
        { barangay: { $regex: search, $options: "i" } },
        { severityLabel: { $regex: search, $options: "i" } },
        { damageTypeLabel: { $regex: search, $options: "i" } },
        { reportStatus: { $regex: search, $options: "i" } },
      ];
    }

    const reports = await NasirangBahayReport.aggregate([
      // 🔹 LOOKUPS (same as yours)
      {
        $lookup: {
          from: "userloginschemas",
          localField: "submitted",
          foreignField: "_id",
          as: "submittedUser",
        },
      },
      { $unwind: "$submittedUser" },

      {
        $lookup: {
          from: "householdleads",
          localField: "submittedUser._id",
          foreignField: "userId",
          as: "householdLead",
        },
      },
      { $unwind: { path: "$householdLead", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "householdmembers",
          localField: "submittedUser._id",
          foreignField: "userId",
          as: "householdMember",
        },
      },
      {
        $unwind: { path: "$householdMember", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "barangays",
          localField: "householdLead.barangayId",
          foreignField: "_id",
          as: "leadBarangay",
        },
      },
      { $unwind: { path: "$leadBarangay", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "householdleads",
          localField: "householdMember.householdLeadId",
          foreignField: "_id",
          as: "memberLead",
        },
      },
      { $unwind: { path: "$memberLead", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "barangays",
          localField: "memberLead.barangayId",
          foreignField: "_id",
          as: "memberBarangay",
        },
      },
      {
        $unwind: { path: "$memberBarangay", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "municipalities",
          localField: "submittedUser.MunicipalityId",
          foreignField: "_id",
          as: "municipality",
        },
      },
      { $unwind: { path: "$municipality", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          barangay: {
            $cond: [
              { $eq: ["$submittedUser.role", "household_lead"] },
              "$leadBarangay.barangayName",
              "$memberBarangay.barangayName",
            ],
          },
        },
      },

      {
        $project: {
          reportId: 1,
          typhoonName: 1,
          damageType: 1,
          damageTypeLabel: 1,
          severity: 1,
          severityLabel: 1,
          address: 1,
          description: 1,
          stillOccupied: 1,
          emergencyNeeded: 1,
          beforeMedia: 1,
          afterMedia: 1,
          materialsUsed: 1,
          location: 1,
          reportStatus: 1,
          createdAt: 1,
          "submittedUser.fullName": 1,
          "submittedUser.username": 1,
          "submittedUser.role": 1,
          "municipality.municipalityName": 1,
          barangay: 1,
        },
      },

      // 🔥 APPLY FILTERS HERE
      { $match: matchFilter },

      { $sort: { createdAt: -1 } },
    ]);

    const allTyphoons = [
      ...new Set(reports.map((r) => r.typhoonName).filter(Boolean)),
    ];

    const allMunicipalities = [
      ...new Set(
        reports.map((r) => r.municipality?.municipalityName).filter(Boolean)
      ),
    ];

    const allBarangays = [
      ...new Set(reports.map((r) => r.barangay).filter(Boolean)),
    ];

    res.status(200).json({
      success: true,
      total: reports.length,
      data: reports,
      typhoons: allTyphoons,
      municipalities: allMunicipalities,
      barangays: allBarangays,
    });
  } catch (error) {
    console.error("DisplayAllNasirangBahay Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};
