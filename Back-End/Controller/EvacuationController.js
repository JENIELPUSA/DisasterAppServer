const Evacuation = require("../Models/EvacuationModel");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");

exports.createEvacuation = async (req, res) => {
  try {
    console.log("req.body", req.body);

    const {
      evacuationName,
      location,
      evacuationCapacity,
      totalHouseholds,
      contactPerson,
      isActive,
      barangay,
    } = req.body;

    // Validation
    if (!barangay?._id || !barangay?.municipality?.id) {
      return res.status(400).json({
        status: "fail",
        message: "Barangay or Municipality ID is missing",
      });
    }

    // Check duplicate
    const existing = await Evacuation.findOne({ evacuationName });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "Evacuation center name already exists.",
      });
    }

    // ✅ SAVE IDS ONLY
    const evacuation = await Evacuation.create({
      evacuationName,
      location,
      evacuationCapacity,
      totalHouseholds,
      contactPerson,
      isActive,

      barangay: new mongoose.Types.ObjectId(barangay._id),
      municipality: new mongoose.Types.ObjectId(barangay.municipality.id),
    });

    res.status(201).json({
      status: "success",
      message: "Evacuation center created successfully.",
      data: evacuation,
    });
  } catch (error) {
    console.error("CREATE EVACUATION ERROR:", error);

    res.status(500).json({
      status: "error",
      message: "Server error while creating evacuation center.",
      error: error.message,
    });
  }
};

exports.deleteEvacuation = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Evacuation.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  await Evacuation.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Barangay deleted successfully.",
  });
});

exports.DisplayEvacuation = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search = "", dateFrom, dateTo } = req.query;

  const matchStage = {};

  // Date filtering
  const hasDateFrom = dateFrom && dateFrom.trim() !== "";
  const hasDateTo = dateTo && dateTo.trim() !== "";

  if (hasDateFrom || hasDateTo) {
    matchStage.createdAt = {};

    if (hasDateFrom) matchStage.createdAt.$gte = new Date(dateFrom);

    if (hasDateTo) {
      const end = new Date(dateTo);
      end.setDate(end.getDate() + 1); // include whole day
      matchStage.createdAt.$lt = end;
    }
  }

  // Aggregation with Barangay lookup
  const pipeline = [
    {
      $match: {
        ...matchStage,
        ...(search.trim()
          ? { name: { $regex: new RegExp(search.trim(), "i") } }
          : {}),
      },
    },
    // Lookup Barangay info
    {
      $lookup: {
        from: "barangays",
        localField: "barangay", // field in Evacuation
        foreignField: "_id",
        as: "barangay",
      },
    },
    { $unwind: { path: "$barangay", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              evacuationName: 1,
              totalHouseholds: 1,
              evacuationCapacity: 1,
              location: 1,
              contactPerson: 1,
              isActive: 1,
              createdAt: 1,
              "barangay.barangayName": 1,
              "barangay.municipality": 1,
              "barangay.fullAddress": 1,
              "barangay.coordinates": 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Evacuation.aggregate(pipeline);

  const data = result[0].data;
  const total = result[0].totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalItems: total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  });
});

exports.DisplayNearbyEvacuations = async (req, res) => {
  try {
    const municipalityId = req.user.MunicipalityId;
    const role = req.user.role;


    console.log("municipalityId",municipalityId)
      console.log("role",role)

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: "fail",
        message: "Valid coordinates required",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const limitedRoles = ["household_lead", "brgy_captain", "household_member"];
    const isLimited = limitedRoles.includes(role);

    // 🔹 Base match: lahat sa sariling municipality at active
    let matchStage = {
      municipality: municipalityId,
      isActive: true,
    };

    // 🔹 Only for restricted roles, filter for available capacity
    if (isLimited) {
      matchStage.$expr = { $lt: ["$totalHouseholds", "$evacuationCapacity"] };
    }

    const pipeline = [
      { $match: matchStage },

      // 🔹 Compute distance (Haversine)
      {
        $addFields: {
          distance: {
            $let: {
              vars: {
                lat1Rad: { $multiply: ["$location.latitude", Math.PI / 180] },
                lon1Rad: { $multiply: ["$location.longitude", Math.PI / 180] },
                lat2Rad: lat * (Math.PI / 180),
                lon2Rad: lng * (Math.PI / 180),
              },
              in: {
                $multiply: [
                  6371000,
                  {
                    $acos: {
                      $add: [
                        {
                          $multiply: [
                            { $sin: "$$lat1Rad" },
                            { $sin: "$$lat2Rad" },
                          ],
                        },
                        {
                          $multiply: [
                            { $cos: "$$lat1Rad" },
                            { $cos: "$$lat2Rad" },
                            { $cos: { $subtract: ["$$lon2Rad", "$$lon1Rad"] } },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // 🔹 Sort nearest first
      { $sort: { distance: 1, createdAt: -1 } },

      // 🔹 Limit only for restricted roles
      ...(isLimited ? [{ $limit: 1 }] : []),

      // 🔹 Project only evacuation fields
      {
        $project: {
          evacuationName: 1,
          totalHouseholds: 1,
          evacuationCapacity: 1,
          location: 1,
          contactPerson: 1,
          isActive: 1,
          distance: 1,
        },
      },
    ];

    const result = await Evacuation.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      data: result,
      totalItems: result.length,
    });
  } catch (error) {
    console.error("DisplayNearbyEvacuations Error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

exports.DisplayOneEvacuation = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Evacuation.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: barangay,
  });
});

exports.updateEvacuation = AsyncErrorHandler(async (req, res) => {
  try {
    console.log("PassData", req.body);
    const id = req.params.id;

    const barangay = await Evacuation.findById(id);
    if (!barangay) {
      return res.status(404).json({
        status: "fail",
        message: "Barangay not found.",
      });
    }

    const allowedFields = [
      "evacuationName",
      "totalHouseholds",
      "evacuationCapacity",
      "currentEvacuation",
      "location",
      "contactPerson",
      "isActive",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      const value = req.body[field];
      if (value !== undefined && value !== null) updateData[field] = value;
    });

    const updated = await Evacuation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Barangay updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating barangay:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update barangay",
      error: error.message,
    });
  }
});

exports.toggleEvacuationStatus = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Evacuation.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  barangay.isActive = !barangay.isActive;
  await barangay.save();

  res.status(200).json({
    status: "success",
    message: `Barangay is now ${barangay.isActive ? "ACTIVE" : "INACTIVE"}`,
    data: barangay,
  });
});
