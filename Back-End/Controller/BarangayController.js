const Barangay = require("../Models/Barangay");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

// Create Barangay
exports.createBarangay = AsyncErrorHandler(async (req, res) => {
  const { name, city, coordinates } = req.body;

  if (!name || !city || !coordinates?.lat || !coordinates?.lng) {
    return res.status(400).json({
      status: "fail",
      message: "Name, city, and coordinates are required.",
    });
  }

  const existing = await Barangay.findOne({ name });
  if (existing) {
    return res.status(400).json({
      status: "fail",
      message: "Barangay already exists.",
    });
  }

  const barangay = await Barangay.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Barangay created successfully.",
    data: barangay,
  });
});

// Get all Barangays with pagination & search
exports.displayBarangays = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search = "", city } = req.query;

  const matchStage = {};
  if (search.trim()) matchStage.name = { $regex: new RegExp(search.trim(), "i") };
  if (city) matchStage.city = city;

  const pipeline = [
    { $match: matchStage },
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

// Get single Barangay by ID
exports.displayOneBarangay = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Barangay.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  res.status(200).json({
    status: "success",
    data: barangay,
  });
});

// Update Barangay
exports.updateBarangay = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Barangay.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  const allowedFields = ["name", "city", "coordinates"];
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

// Delete Barangay
exports.deleteBarangay = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  const barangay = await Barangay.findById(id);
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
