const Tracking = require("../Models/TrackingEvacuates");
const mongoose = require("mongoose");

exports.createTracking = async (req, res) => {
  try {
    const { evacuationId, scanType, municipality, userId } = req.body;
    const io = req.app.get("io");

    // Validate required fields
    if (!evacuationId || !scanType || !userId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields: evacuationId, scanType, or userId",
      });
    }
    let tracking = await Tracking.findOne({ evacuationId, userId });

    if (tracking) {
      if (scanType === "check_out") {
        tracking.scanType = scanType;
        tracking.municipality = municipality; // optional
        tracking.checkedOutAt = new Date(); // optional, record timestamp
        await tracking.save();

        return res.status(200).json({
          status: "success",
          message: "Tracking updated (check_out)",
          data: tracking,
        });
      } else if (scanType === "check_in") {
        return res.status(200).json({
          status: "success",
          message: "User has already checked in",
          data: tracking,
        });
      }
    }

    tracking = await Tracking.create({
      evacuationId,
      scanType,
      userId,
      municipality,
      checkedInAt: scanType === "check_in" ? new Date() : null,
    });

    io.emit("tracking:new", tracking);

    res.status(201).json({
      status: "success",
      message: "Tracking created",
      data: tracking,
    });
  } catch (err) {
    console.error("Create Tracking Error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to create tracking",
    });
  }
};

exports.getTrackingByEvacuation = async (req, res) => {
  try {
    const { evacuationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(evacuationId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid evacuation ID",
      });
    }

    const logs = await Tracking.find({ evacuationId })
      .populate("userId", "fullname role")
      .populate("municipality", "municipalityName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      total: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error("Get Tracking Error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch tracking logs",
    });
  }
};

/**
 * GET tracking logs by user
 */
exports.getTrackingByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const logs = await Tracking.find({ userId })
      .populate("evacuationId", "evacuationName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      total: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error("User Tracking Error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user tracking",
    });
  }
};

/**
 * DELETE tracking (optional, admin use)
 */
exports.deleteTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Tracking.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Tracking record not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Tracking deleted successfully",
    });
  } catch (err) {
    console.error("Delete Tracking Error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete tracking",
    });
  }
};
