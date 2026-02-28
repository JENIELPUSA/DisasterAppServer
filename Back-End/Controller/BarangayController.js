const Barangay = require("../Models/Barangay");
const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.createBarangay = AsyncErrorHandler(async (req, res) => {
  try {
    const { barangayName, municipality, coordinates, fullAddress } = req.body;

    console.log("req.body", req.body);

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
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get all Barangays with pagination & search
exports.displayBarangays = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 200;
  const skip = (page - 1) * limit;

  const { search = "", city } = req.query;

  const matchStage = {};
  if (search.trim())
    matchStage.barangayName = { $regex: new RegExp(search.trim(), "i") }; // <-- use barangayName
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
  const io = req.app.get("io");
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
    "coordinates",
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

  io.emit("UpdateBarangay:new", updatedBarangay);

  res.status(200).json({
    status: "success",
    message: "Barangay updated successfully.",
    data: updatedBarangay,
  });
});

// Delete Barangay
exports.deleteBarangay = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  const io = req.app.get("io");
  const barangay = await Barangay.findById(id);
  if (!barangay) {
    return res.status(404).json({
      status: "fail",
      message: "Barangay not found.",
    });
  }

  const update = await Barangay.findByIdAndDelete(id);

  io.emit("DeletedBarangay:new", update);

  res.status(200).json({
    status: "success",
    message: "Barangay deleted successfully.",
  });
});

// Get Barangays for Dropdown
exports.getBarangays = AsyncErrorHandler(async (req, res, next) => {
  const barangays = await Barangay.find()
    .select("barangayName") // Only include barangayName
    .sort({ barangayName: 1 });

  res.status(200).json({
    success: true,
    count: barangays.length, // fixed
    data: barangays, // fixed
  });
});

exports.displayBarangaysForUser = AsyncErrorHandler(async (req, res) => {
  const { search = "", page = 1, limit = 20, MunicipalityId } = req.query;
  const skip = (page - 1) * limit;

  if (!MunicipalityId) {
    return res.status(400).json({
      status: "fail",
      message: "User does not have a MunicipalityId",
    });
  }

  const matchStage = {
    municipality: new mongoose.Types.ObjectId(MunicipalityId),
  };
  if (search.trim()) {
    matchStage.barangayName = { $regex: new RegExp(search.trim(), "i") };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "municipalities", // collection name
        localField: "municipality", // field sa Barangay
        foreignField: "_id", // field sa Municipality
        as: "municipality",
      },
    },
    { $unwind: "$municipality" }, // para gawing object lang
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Barangay.aggregate(pipeline);
  const data = result[0].data.map((item) => ({
    _id: item._id,
    barangayName: item.barangayName,
    fullAddress: item.fullAddress,
    coordinates: item.coordinates,
    municipality: {
      id: item.municipality._id,
      name: item.municipality.municipalityName,
    },
  }));

  const total = result[0].totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalItems: total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

exports.dropdownbarangayformaps = AsyncErrorHandler(async (req, res) => {
  const MunicipalityId = req.user.MunicipalityId;
  const { search = "", page = 1, limit = 20 } = req.query;

  if (!MunicipalityId) {
    return res.status(400).json({
      status: "fail",
      message: "User does not have a MunicipalityId",
    });
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const matchStage = {
    municipality: new mongoose.Types.ObjectId(MunicipalityId),
  };

  if (search.trim()) {
    matchStage.barangayName = { $regex: search.trim(), $options: "i" };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "municipalities",
        localField: "municipality",
        foreignField: "_id",
        as: "municipalityInfo",
      },
    },
    { $unwind: "$municipalityInfo" },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limitNum }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Barangay.aggregate(pipeline);
  const barangays = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  const data = barangays.map((item) => ({
    _id: item._id,
    barangayName: item.barangayName,
    fullAddress: item.fullAddress,
  }));

  res.status(200).json({
    status: "success",
    data,
    totalItems: total,
    currentPage: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});
