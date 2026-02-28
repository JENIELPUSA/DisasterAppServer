const Evacuation = require("../Models/EvacuationModel");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");

exports.createEvacuation = async (req, res) => {
  try {
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

    // SAVE IDS ONLY
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
  const io = req.app.get("io");

  const barangay = await Evacuation.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  const removeEvacuation = await Evacuation.findByIdAndDelete(id);

  io.emit("removeEvacuation:new", removeEvacuation);

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

exports.DisplayEvacuationInBarangay = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search = "", dateFrom, dateTo } = req.query;
  const { barangayId } = req.params;
  // Validate barangayId
  if (!mongoose.Types.ObjectId.isValid(barangayId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid barangayId",
    });
  }

  const matchStage = {
    barangay: new mongoose.Types.ObjectId(barangayId), // ✅ fix here
  };

  // Filter by search (Evacuation Name)
  if (search.trim() !== "") {
    matchStage.evacuationName = { $regex: new RegExp(search.trim(), "i") };
  }

  // Filter by date
  if (
    (dateFrom && dateFrom.trim() !== "") ||
    (dateTo && dateTo.trim() !== "")
  ) {
    matchStage.createdAt = {};
    if (dateFrom && dateFrom.trim() !== "")
      matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo && dateTo.trim() !== "") {
      const end = new Date(dateTo);
      end.setDate(end.getDate() + 1); // include whole day
      matchStage.createdAt.$lt = end;
    }
  }

  console.log("Match Stage:", matchStage);

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "barangays",
        localField: "barangay",
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
    const municipalityId = new mongoose.Types.ObjectId(req.user.MunicipalityId);
    const role = req.user.role;
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

    // Base match
    let matchStage = {
      municipality: municipalityId,
      isActive: true,
    };

    if (isLimited) {
      matchStage.$expr = { $lt: ["$totalHouseholds", "$evacuationCapacity"] };
    }

    const pipeline = [
      { $match: matchStage },

      // Compute distance
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

      // 🔹 Lookup sa Tracking para sa total evacuees
      {
        $lookup: {
          from: "trackings",
          localField: "_id",
          foreignField: "evacuationId",
          as: "trackingData",
        },
      },
      {
        $addFields: {
          totalEvacuates: {
            $size: {
              $filter: {
                input: "$trackingData",
                as: "t",
                cond: { $eq: ["$$t.scanType", "check_in"] },
              },
            },
          },
        },
      },

      // Sort nearest first
      { $sort: { distance: 1, createdAt: -1 } },

      // Limit for restricted roles
      ...(isLimited ? [{ $limit: 1 }] : []),

      // Project fields
      {
        $project: {
          evacuationName: 1,
          totalHouseholds: 1,
          evacuationCapacity: 1,
          location: 1,
          contactPerson: 1,
          isActive: 1,
          distance: 1,
          totalEvacuates: 1, // **idagdag dito**
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

exports.DisplayAllEvacuationInMunicipality = async (req, res) => {
  try {
    const municipalityId = new mongoose.Types.ObjectId(req.user.MunicipalityId);

    const pipeline = [
      {
        $match: {
          municipality: municipalityId,
          isActive: true,
        },
      },
      {
        // join sa Tracking collection
        $lookup: {
          from: "trackings", // pangalan ng Tracking collection sa DB
          localField: "_id", // Evacuation _id
          foreignField: "evacuationId", // field sa Tracking
          as: "trackingData",
        },
      },
      {
        // bilangin ang total evacuees per evacuation
        $addFields: {
          totalEvacuates: {
            $size: {
              $filter: {
                input: "$trackingData",
                as: "t",
                cond: { $eq: ["$$t.scanType", "check_in"] }, // count lang check_in
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 }, // newest first
      },
      {
        // pipiliin lang yung fields na gusto mo ipakita
        $project: {
          evacuationName: 1,
          totalHouseholds: 1,
          evacuationCapacity: 1,
          location: 1,
          contactPerson: 1,
          isActive: 1,
          municipality: 1,
          totalEvacuates: 1, // **dagdag dito**
        },
      },
    ];

    const result = await Evacuation.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      totalItems: result.length,
      data: result,
    });
  } catch (error) {
    console.error("DisplayAllEvacuationInMunicipality Error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
