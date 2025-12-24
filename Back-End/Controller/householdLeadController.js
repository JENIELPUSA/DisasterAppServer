// controllers/householdLeadController.js
const HouseholdLead = require("../Models/HouseholdLead");
const User = require("../Models/UserModel");
const HouseholdMember = require("../Models/HouseholdMember");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const mongoose = require("mongoose");

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

// Get household leads by barangayId
exports.getHouseholdLeadsByBarangayId = async (req, res) => {
  try {
    const { barangayId } = req.params; // or req.query.barangayId

    if (!barangayId) {
      return res.status(400).json({
        success: false,
        message: "barangayId is required",
      });
    }

    // Get household leads in the barangay
    const householdLeads = await HouseholdLead.find({ barangayId })
      .populate("userId", "fullName email contactNumber address barangay");

    if (!householdLeads.length) {
      return res.status(404).json({
        success: false,
        message: "No household leads found for this barangay",
      });
    }

    // Get members per household lead
    const leadsWithMembers = await Promise.all(
      householdLeads.map(async (lead) => {
        const members = await HouseholdMember.find({
          householdLeadId: lead._id,
        }).populate("userId", "fullName email contactNumber");

        return {
          ...lead.toObject(),
          members,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: leadsWithMembers,
    });
  } catch (error) {
    console.error("Get household leads by barangay error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
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
        $match: { barangayId: new mongoose.Types.ObjectId(barangayId) }
      });
    }

    // Lookup user info
    pipeline.push({
      $lookup: {
        from: "userloginschemas",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo"
      }
    });
    pipeline.push({
      $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true }
    });

    // Lookup barangay info
    pipeline.push({
      $lookup: {
        from: "barangays",
        localField: "barangayId",
        foreignField: "_id",
        as: "barangayInfo"
      }
    });
    pipeline.push({
      $unwind: { path: "$barangayInfo", preserveNullAndEmptyArrays: true }
    });

    // Project final fields
    pipeline.push({
      $project: {
        id: "$_id",
        householdCode: 1,
        createdAt: 1,
        userId: { $ifNull: ["$userInfo._id", "Not Available"] },
        fullName: { $ifNull: ["$userInfo.fullName", "Not Available"] },
        contactNumber: { $ifNull: ["$userInfo.contactNumber", "Not Available"] },
        address: { $ifNull: ["$barangayInfo.fullAddress", "Not Available"] },
        barangay: { $ifNull: ["$barangayInfo.barangayName", "Not Available"] },
        familyMembers: { $ifNull: ["$familyMembers", 0] }
      }
    });

    // Sort latest first
    pipeline.push({ $sort: { createdAt: -1 } });

    // Execute aggregation
    const data = await HouseholdLead.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("Get Household Leads Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
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
