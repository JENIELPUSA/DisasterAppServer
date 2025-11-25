const LogActionAudit = require("../Models/LogActionAudit");
const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

exports.displayAuditLogs = AsyncErrorHandler(async (req, res) => {
  const { search = "", from, to, limit = 8, page = 1, action_type } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const matchStage = {};
  if (from || to) {
    matchStage.timestamp = {};
    if (from) matchStage.timestamp.$gte = new Date(from);
    if (to) matchStage.timestamp.$lte = new Date(to);
  }
  if (action_type && action_type !== "All") {
    matchStage.action_type = { $regex: new RegExp(`^${action_type}$`, "i") };
  }

  if (search.trim()) {
    const searchTerms = search.trim().split(/\s+/);
    const searchConditions = searchTerms.map((term) => ({
      $or: [
        { action_type: { $regex: term, $options: "i" } },
        { module: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { "user_info.first_name": { $regex: term, $options: "i" } },
        { "user_info.last_name": { $regex: term, $options: "i" } },
      ],
    }));

    // Combine existing matchStage with $and search logic safely
    if (Object.keys(matchStage).length > 0) {
      matchStage.$and = [...(matchStage.$and || []), ...searchConditions];
    } else {
      matchStage.$and = searchConditions;
    }
  }

  const pipeline = [
    {
      $lookup: {
        from: "userloginschemas",
        localField: "performed_by",
        foreignField: "linkedId",
        as: "user_info",
      },
    },
    {
      $unwind: {
        path: "$user_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: matchStage },
    {
      $project: {
        _id: 1,
        action_type: 1,
        module: 1,
        description: 1,
        reference_id: 1,
        old_data: 1,
        new_data: 1,
        ip_address: 1,
        timestamp: 1,
        performed_by: "$performed_by",
        performed_by_name: {
          $concat: [
            { $ifNull: ["$user_info.first_name", ""] },
            " ",
            { $ifNull: ["$user_info.last_name", ""] },
          ],
        },
        role: "$user_info.role",
      },
    },
    { $sort: { timestamp: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const results = await LogActionAudit.aggregate(pipeline);
  const data = results[0]?.data || [];
  const totalLogs = results[0]?.totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalLogs,
    totalPages: Math.ceil(totalLogs / parseInt(limit)),
    currentPage: parseInt(page),
  });
});