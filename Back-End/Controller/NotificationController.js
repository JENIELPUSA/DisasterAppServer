// controllers/notificationController.js
const Notification = require("../Models/NotificationSchema");

exports.createNotification = async (req, res) => {
  try {
    const { type, title, message, location, barangayId, municipalityId, address, meta, expiresAt } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ status: "error", message: "Type, title, and message are required" });
    }

    const notification = new Notification({
      type,
      title,
      message,
      location: location || {},
      barangayId,
      municipalityId,
      address,
      createdBy: req.user?._id,
      meta,
      expiresAt,
    });

    await notification.save();

    // --- Emit to Socket.io users in the same municipality ---
    const io = req.app.get("io");
    if (municipalityId) {
      for (const userId in global.connectedUsers) {
        const user = global.connectedUsers[userId];
        if (user.municipalityId === municipalityId) {
          io.to(user.socketId).emit("notification:new", notification);
        }
      }
    } else {
      // fallback: emit to all users if municipality not specified
      io.emit("notification:new", notification);
    }

    res.status(201).json({ status: "success", data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const municipalityId = req.user?.MunicipalityId;
    if (!municipalityId) {
      return res.status(200).json({
        status: "success",
        data: null,
      });
    }

    const notifications = await Notification.find({
      municipalityId: municipalityId,
    })
      .populate("barangayId", "name")
      .populate("municipalityId", "name")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: notifications,
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ status: "error", message: "Notification not found" });
    }

    res.status(200).json({ status: "success", message: "Notification deleted", data: notification });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
