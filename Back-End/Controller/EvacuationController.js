const Evacuation = require("../Models/EvacuationModel");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.createEvacuation = AsyncErrorHandler(async (req, res) => {
  const { name } = req.body;

  const existing = await Evacuation.findOne({ name });
  if (existing) {
    return res.status(400).json({
      status: "fail",
      message: "Barangay name already exists.",
    });
  }

  const barangay = await Evacuation.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Barangay created successfully.",
    data: barangay,
  });
});

exports.deleteEvacuation = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Evacuation.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  await Barangay.findByIdAndDelete(id);

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

  // Aggregation
  const pipeline = [
    {
      $match: {
        ...matchStage,
        ...(search.trim()
          ? {
              name: { $regex: new RegExp(search.trim(), "i") },
            }
          : {}),
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Barangay.aggregate(pipeline);

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

  const barangay = await Barangay.findById(id);
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
  const id = req.params.id;

  const barangay = await Barangay.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  const allowedFields = [
    "name",
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

  const updated = await Barangay.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Barangay updated successfully.",
    data: updated,
  });
});

exports.toggleEvacuationStatus = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Barangay.findById(id);
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
