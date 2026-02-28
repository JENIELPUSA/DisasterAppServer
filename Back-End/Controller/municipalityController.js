const Municipality = require("../Models/MunicipalitySchema");

exports.getMunicipalities = async (req, res) => {
  try {
    const municipalities = await Municipality.aggregate([
      {
        $lookup: {
          from: "barangays", // collection name (plural)
          localField: "_id",
          foreignField: "municipality",
          as: "barangays",
        },
      },
      {
        $addFields: {
          barangayCount: { $size: "$barangays" },
        },
      },
      {
        $project: {
          barangays: 0, // alisin array, count lang
        },
      },
      {
        $sort: {
          municipalityName: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      total: municipalities.length,
      data: municipalities,
    });
  } catch (err) {
    console.error("Get Municipalities Error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
exports.createMunicipality = async (req, res) => {
  try {
    const { municipalityName, code } = req.body;

    if (!municipalityName) {
      return res
        .status(400)
        .json({ status: "fail", message: "municipalityName is required" });
    }

    const existing = await Municipality.findOne({ municipalityName });
    if (existing) {
      return res
        .status(400)
        .json({ status: "fail", message: "Municipality already exists" });
    }

    const newMunicipality = new Municipality({ municipalityName, code });
    await newMunicipality.save();

    res.status(201).json({
      status: "success",
      data: newMunicipality,
    });
  } catch (err) {
    console.error("Create Municipality Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getMunicipalityById = async (req, res) => {
  try {
    const municipality = await Municipality.findById(req.params.id);

    if (!municipality)
      return res
        .status(404)
        .json({ status: "fail", message: "Municipality not found" });

    res.status(200).json({ status: "success", data: municipality });
  } catch (err) {
    console.error("Get Municipality Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.updateMunicipality = async (req, res) => {
  try {
    const { municipalityName, code } = req.body;

    const updated = await Municipality.findByIdAndUpdate(
      req.params.id,
      { municipalityName, code },
      { new: true, runValidators: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ status: "fail", message: "Municipality not found" });

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    console.error("Update Municipality Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteMunicipality = async (req, res) => {
  try {
    const deleted = await Municipality.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res
        .status(404)
        .json({ status: "fail", message: "Municipality not found" });

    res
      .status(200)
      .json({ status: "success", message: "Municipality deleted" });
  } catch (err) {
    console.error("Delete Municipality Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
