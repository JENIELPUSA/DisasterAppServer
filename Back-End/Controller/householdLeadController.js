// controllers/householdLeadController.js
const HouseholdLead = require("../Models/HouseholdLead");
const User = require("../Models/UserModel");
const HouseholdMember = require("../Models/HouseholdMember");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");

exports.DisplayNearHouseLead = async (req, res, io) => {
  try {
    const { latitude, longitude, Distance = 1000 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: "fail",
        message: "Valid coordinates required",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        status: "fail",
        message: "Valid coordinates required",
      });
    }

    const pipeline = [
      /* ================== COMPUTE DISTANCE ================== */
      {
        $addFields: {
          distance: {
            $let: {
              vars: {
                lat1Rad: { $multiply: ["$location.latitude", Math.PI / 180] },
                lon1Rad: { $multiply: ["$location.longitude", Math.PI / 180] },
                lat2Rad: lat * (Math.PI / 180),
                lon2Rad: lng * (Math.PI / 180),
              },
              in: {
                $multiply: [
                  6371000,
                  {
                    $acos: {
                      $add: [
                        {
                          $multiply: [
                            { $sin: "$$lat1Rad" },
                            { $sin: "$$lat2Rad" },
                          ],
                        },
                        {
                          $multiply: [
                            { $cos: "$$lat1Rad" },
                            { $cos: "$$lat2Rad" },
                            { $cos: { $subtract: ["$$lon2Rad", "$$lon1Rad"] } },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      /* ================== FILTER BY RADIUS ================== */
      {
        $match: {
          $expr: {
            $and: [
              { $lte: ["$distance", Distance] },
              { $lt: ["$totalHouseholds", "$evacuationCapacity"] },
            ],
          },
          isActive: true,
        },
      },

      /* ================== GET NEAREST BARANGAY ONLY ================== */
      { $sort: { distance: 1 } },
      {
        $group: {
          _id: "$barangay",
          nearestEvacuation: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$nearestEvacuation" },
      },

      /* ================== JOIN BARANGAY INFO ================== */
      {
        $lookup: {
          from: "barangays",
          localField: "barangay",
          foreignField: "_id",
          as: "barangay",
        },
      },
      { $unwind: "$barangay" },

      /* ================== LIMIT TO ONE BARANGAY RESULT ================== */
      { $limit: 1 },

      /* ================== PROJECT ================== */
      {
        $project: {
          evacuationName: 1,
          totalHouseholds: 1,
          evacuationCapacity: 1,
          location: 1,
          contactPerson: 1,
          isActive: 1,
          distance: 1,
          "barangay.barangayName": 1,
          "barangay.municipality": 1,
          "barangay.fullAddress": 1,
        },
      },
    ];

    const result = await HouseholdLead.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      data: result,
      totalItems: result.length,
    });
  } catch (error) {
    console.error("DisplayNearHouseLead Error:", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Create household lead profile
exports.createHouseholdLead = async (req, res) => {
  try {
    const { userId, familyMembers, emergencyContact } = req.body;

    // Check if user exists and has household_lead role
    const user = await User.findById(userId);
    if (!user || user.role !== "household_lead") {
      return res.status(400).json({
        success: false,
        message: "User not found or incorrect role",
      });
    }

    // Check if household lead profile already exists
    const existingHouseholdLead = await HouseholdLead.findOne({ userId });
    if (existingHouseholdLead) {
      return res.status(400).json({
        success: false,
        message: "Household lead profile already exists for this user",
      });
    }

    // Create new household lead
    const newHouseholdLead = new HouseholdLead({
      userId,
      familyMembers,
      emergencyContact,
      totalMembers: 1, // Start with 1 (the lead)
    });

    await newHouseholdLead.save();

    // Populate user details
    const populatedHouseholdLead = await HouseholdLead.findById(
      newHouseholdLead._id
    ).populate("userId", "fullName email contactNumber address barangay");

    res.status(201).json({
      success: true,
      message: "Household lead profile created successfully",
      data: populatedHouseholdLead,
    });
  } catch (error) {
    console.error("Create household lead error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getHouseholdLeadsByBarangayId = async (req, res) => {
  try {
    const { barangayId } = req.params;
    if (!barangayId)
      return res
        .status(400)
        .json({ success: false, message: "barangayId is required" });

    const data = await HouseholdLead.aggregate([
      { $match: { barangayId: new mongoose.Types.ObjectId(barangayId) } },
      // Lookup household members
      {
        $lookup: {
          from: "householdmembers",
          localField: "_id",
          foreignField: "householdLeadId",
          as: "members",
        },
      },
      // Lookup household creator from UserLoginSchema
      {
        $lookup: {
          from: "userloginschemas", // 🔹 collection name derived from model
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          barangayId: 1,
          rescueStatus: 1,
          totalMembers: 1,
          householdCode: 1,
          location: 1,
          createdAt: 1,
          user: { fullName: 1, email: 1, contactNumber: 1, address: 1 },
          members: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get household leads by barangay error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update household lead profile
exports.updateHouseholdLead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { familyMembers, emergencyContact } = req.body;

    // Check if household lead exists
    const householdLead = await HouseholdLead.findOne({ userId });
    if (!householdLead) {
      return res.status(404).json({
        success: false,
        message: "Household lead profile not found",
      });
    }

    const updateData = {};
    if (familyMembers) updateData.familyMembers = familyMembers;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;

    // Check if household is full
    if (familyMembers && householdLead.totalMembers > familyMembers) {
      updateData.isFull = true;
    } else {
      updateData.isFull = false;
    }

    const updatedHouseholdLead = await HouseholdLead.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userId", "fullName email contactNumber address barangay");

    res.status(200).json({
      success: true,
      message: "Household lead profile updated successfully",
      data: updatedHouseholdLead,
    });
  } catch (error) {
    console.error("Update household lead error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAllHouseholdLeads = async (req, res) => {
  try {
    const { barangayId } = req.query;

    const pipeline = [];

    // Filter by barangayId if provided
    if (barangayId && mongoose.Types.ObjectId.isValid(barangayId)) {
      pipeline.push({
        $match: { barangayId: new mongoose.Types.ObjectId(barangayId) },
      });
    }

    // Lookup user info
    pipeline.push({
      $lookup: {
        from: "userloginschemas",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    });
    pipeline.push({
      $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true },
    });

    // Lookup barangay info
    pipeline.push({
      $lookup: {
        from: "barangays",
        localField: "barangayId",
        foreignField: "_id",
        as: "barangayInfo",
      },
    });
    pipeline.push({
      $unwind: { path: "$barangayInfo", preserveNullAndEmptyArrays: true },
    });

    // Project final fields
    pipeline.push({
      $project: {
        id: "$_id",
        householdCode: 1,
        createdAt: 1,
        userId: { $ifNull: ["$userInfo._id", "Not Available"] },
        fullName: { $ifNull: ["$userInfo.fullName", "Not Available"] },
        contactNumber: {
          $ifNull: ["$userInfo.contactNumber", "Not Available"],
        },
        address: { $ifNull: ["$barangayInfo.fullAddress", "Not Available"] },
        barangay: { $ifNull: ["$barangayInfo.barangayName", "Not Available"] },
        familyMembers: { $ifNull: ["$familyMembers", 0] },
      },
    });

    // Sort latest first
    pipeline.push({ $sort: { createdAt: -1 } });

    // Execute aggregation
    const data = await HouseholdLead.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Household Leads Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Search household leads by name
exports.searchHouseholdLeads = async (req, res) => {
  try {
    const { search, barangay } = req.query;

    // Search users by name
    let userFilter = {
      role: "household_lead",
      isActive: true,
      fullName: { $regex: search, $options: "i" },
    };

    if (barangay) userFilter.barangay = barangay;

    const users = await User.find(userFilter).select(
      "_id fullName email contactNumber address barangay"
    );

    const userIds = users.map((user) => user._id);

    // Get household leads for these users
    const householdLeads = await HouseholdLead.find({
      userId: { $in: userIds },
    }).populate("userId", "fullName email contactNumber address barangay");

    const result = householdLeads.map((lead) => ({
      id: lead._id,
      name: lead.userId.fullName,
      address: lead.userId.address,
      contact: lead.userId.contactNumber,
      members: lead.totalMembers,
      barangay: lead.userId.barangay,
      isFull: lead.isFull,
      householdCode: lead.householdCode,
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Search household leads error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Household Leads for Dropdown
exports.getHouseholdLeads = AsyncErrorHandler(async (req, res, next) => {
  const { barangay, search } = req.query;

  // Build query
  let userQuery = { role: "household_lead", isActive: true };
  if (barangay) userQuery.barangay = barangay;
  if (search) {
    userQuery.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const householdLeadUsers = await User.find(userQuery).select(
    "_id fullName email contactNumber address barangay"
  );

  const userIds = householdLeadUsers.map((user) => user._id);

  const householdLeads = await HouseholdLead.find({
    userId: { $in: userIds },
  }).select("familyMembers totalMembers householdCode isFull");

  // Combine data
  const result = householdLeads.map((lead) => {
    const user = householdLeadUsers.find(
      (u) => u._id.toString() === lead.userId.toString()
    );
    return {
      id: lead._id,
      name: user?.fullName || "Unknown",
      email: user?.email || "Unknown",
      address: user?.address || "Unknown",
      contact: user?.contactNumber || "Unknown",
      barangay: user?.barangay || "Unknown",
      members: lead.totalMembers || 0,
      maxMembers: lead.familyMembers || 0,
      isFull: lead.isFull,
      householdCode: lead.householdCode,
    };
  });

  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
});

exports.DropdownAllHouseHold = async (req, res) => {
  try {
    const { barangay } = req.query; // Barangay ID from query
    if (!barangay) {
      return res.status(400).json({
        success: false,
        message: "Barangay ID is required",
      });
    }

    const householdLeads = await HouseholdLead.aggregate([
      // Lookup user details
      {
        $lookup: {
          from: "userloginschemas", // collection name sa MongoDB
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" }, // flatten user array

      // Filter by barangayId in HouseholdLead
      {
        $match: {
          barangayId: new mongoose.Types.ObjectId(barangay),
        },
      },

      // Project only needed fields
      {
        $project: {
          id: "$_id",
          name: "$user.fullName",
          address: "$user.address",
          contact: "$user.contactNumber",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: householdLeads.length,
      data: householdLeads,
    });
  } catch (error) {
    console.error("Get all household leads error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Household Leads for Dropdown using $lookup including barangay
exports.getHouseholdLeadsSendNotification = AsyncErrorHandler(
  async (req, res, next) => {
    const householdLeads = await HouseholdLead.aggregate([
      {
        $match: {
          rescueStatus: { $ne: "none" }, // filter only leads with active rescue
        },
      },
      {
        $lookup: {
          from: "userloginschemas",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "barangays", // collection name ng Barangay model sa MongoDB
          localField: "barangayId",
          foreignField: "_id",
          as: "barangay",
        },
      },
      { $unwind: { path: "$barangay", preserveNullAndEmptyArrays: true } }, // allow null
      // Select fields
      {
        $project: {
          id: "$_id",
          name: "$user.fullName",
          email: "$user.email",
          address: "$user.address",
          contact: "$user.contactNumber",
          barangayName: "$barangay.name", // adjust field name sa collection mo
          members: "$totalMembers",
          maxMembers: "$familyMembers",
          location: 1,
          isFull: 1,
          householdCode: 1,
          rescueStatus: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: householdLeads.length,
      data: householdLeads,
    });
  }
);
