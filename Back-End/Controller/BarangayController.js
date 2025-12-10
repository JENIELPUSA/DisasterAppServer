const Barangay = require("../Models/Barangay");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
exports.createBarangay = AsyncErrorHandler(async (req, res) => {
  const { barangayName, municipality, coordinates, fullAddress } = req.body;

  // Check if barangay already exists
  const existing = await Barangay.findOne({ barangayName });
  if (existing) {
    return res.status(400).json({
      status: "fail",
      message: "Barangay already exists.",
    });
  }

  const barangay = await Barangay.create({
    barangayName,
    municipality,
    coordinates,
    fullAddress,
  });

  res.status(201).json({
    status: "success",
    message: "Barangay created successfully.",
    data: barangay,
  });
});

// Get all Barangays with pagination & search
exports.displayBarangays = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 200;
  const skip = (page - 1) * limit;

  const { search = "", city } = req.query;

  const matchStage = {};
  if (search.trim()) matchStage.barangayName = { $regex: new RegExp(search.trim(), "i") }; // <-- use barangayName
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
// Update Barangay
exports.updateBarangay = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  console.log("Data Pass", req.body);

  // Find barangay by ID
  const barangay = await Barangay.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  // Allowed fields that can be updated
  const allowedFields = [
    "barangayName",
    "municipality",
    "fullAddress",
    "coordinates"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      updateData[field] = req.body[field];
    }
  });

  // Perform update
  const updatedBarangay = await Barangay.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Barangay updated successfully.",
    data: updatedBarangay,
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

// Get Barangays for Dropdown
exports.getBarangays = AsyncErrorHandler(async (req, res, next) => {
  const barangays = await Barangay.find({ isActive: true })
    .select('name code city province')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: barangays.length,
    data: barangays
  });
});
