const Evacuation = require("../Models/EvacuationModel");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.createEvacuation = async (req, res) => {
  try {
    const { evacuationName,location } = req.body;

    // Check if evacuation center with the same name exists
    const existing = await Evacuation.findOne({ evacuationName });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "Evacuation center name already exists.",
      });
    }

    // Create new evacuation center
    const evacuation = await Evacuation.create(req.body);

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
              totalHouseholds:1,
              evacuationCapacity:1,
              location:1,
              contactPerson:1,
              isActive:1,
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
      "isActive"
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
