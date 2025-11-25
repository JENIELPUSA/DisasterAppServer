const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Notification = require("./../Models/NotificationSchema");
const ApiFeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");

exports.createNotification = AsyncErrorHandler(async (req, res) => {
  const { message, userIds } = req.body;

  const viewers = userIds.map((id) => ({
    user: new mongoose.Types.ObjectId(id),
    isRead: false,
  }));
  const newNotification = await Notification.create({ message, viewers });
  res.status(201).json({
    status: "success",
    data: newNotification,
  });
});

exports.getByLinkId = AsyncErrorHandler(async (req, res) => {
  const { linkId } = req.params;
  const { limit } = req.query;

  // Default limit = 5, unless limit=all
  let queryLimit = 5;
  if (limit && limit.toLowerCase() === "all") {
    queryLimit = 0;
  }

  // Query notifications for this user
  const notificationsQuery = Notification.find({
    "viewers.user": linkId,
  }).sort({ createdAt: -1 });

  if (queryLimit > 0) {
    notificationsQuery.limit(queryLimit);
  }

  const notifications = await notificationsQuery;

  // Count unread notifications for this user
  const unreadCount = await Notification.countDocuments({
    viewers: { $elemMatch: { user: linkId, isRead: false } },
  });

  res.status(200).json({
    status: "success",
    unreadCount,
    data: notifications,
  });
});



exports.markAsRead = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { linkId } = req.body; // linkId = user._id na target

  if (!linkId) {
    return res.status(400).json({ message: "linkId is required" });
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  const viewer = notification.viewers.find((v) => v.user.toString() === linkId);
  if (!viewer) {
    return res
      .status(403)
      .json({ message: "Not authorized to read this notification" });
  }

  if (!viewer.isRead) {
    viewer.isRead = true;
    await notification.save();
  }

  // --- Emit sa specific client lang ---
  const io = req.app.get("io");
  const target = global.connectedUsers[linkId]; 

  if (target) {
    io.to(target.socketId).emit("RefreshNotifications", {
      message: "Notification updated",
    });
    console.log(`Sent RefreshNotifications to linkId ${linkId}`);
  }

  res.status(200).json({ message: "Notification marked as read" });
});

exports.DisplayNotification = AsyncErrorHandler(async (req, res) => {
  let limit = 5; // default limit
  if (req.query.showAll === "true") {
    limit = null;
  }

  let query = Notification.find().sort({ createdAt: -1 });

  if (limit) {
    query = query.limit(limit);
  }

  const dataNotification = await query;

  res.status(200).json({
    status: "success",
    results: dataNotification.length,
    data: dataNotification,
  });
});

exports.deleteNotification = AsyncErrorHandler(async (req, res) => {
  const deleted = await Notification.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      status: "fail",
      message: "Notification not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
