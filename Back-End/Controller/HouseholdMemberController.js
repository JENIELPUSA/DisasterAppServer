const HouseholdMember = require("../Models/HouseholdMember");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const HouseholdLead = require("../Models/HouseholdLead");
const User = require("../Models/HouseholdMember");
const UserLogin = require("../Models/LogInSchema");
const mongoose = require("mongoose");

exports.createHouseholdMember = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      userId,
      householdLeadId,
      relationship,
      householdAddress,
      householdLeadName,
    } = req.body;

    // Check if user exists and has household_member role
    const user = await User.findById(userId);
    if (!user || user.role !== "household_member") {
      return res.status(400).json({
        success: false,
        message: "User not found or incorrect role",
      });
    }

    // Check if household member profile already exists
    const existingHouseholdMember = await HouseholdMember.findOne({ userId });
    if (existingHouseholdMember) {
      return res.status(400).json({
        success: false,
        message: "Household member profile already exists for this user",
      });
    }

    // Check if household lead exists and is not full
    const householdLead = await HouseholdLead.findById(householdLeadId);
    if (!householdLead) {
      return res.status(404).json({
        success: false,
        message: "Household lead not found",
      });
    }

    if (householdLead.isFull) {
      return res.status(400).json({
        success: false,
        message: "Household is already full",
      });
    }

    // Check if family members limit is reached
    if (householdLead.totalMembers >= householdLead.familyMembers) {
      await HouseholdLead.findByIdAndUpdate(householdLeadId, { isFull: true });
      return res.status(400).json({
        success: false,
        message: "Household has reached maximum members",
      });
    }

    // Generate verification code
    const verificationCode = Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase();

    // Create new household member
    const newHouseholdMember = new HouseholdMember({
      userId,
      householdLeadId,
      relationship,
      householdAddress,
      householdLeadName,
      verificationCode,
      isVerified: false,
    });

    await newHouseholdMember.save();

    // Update household lead total members
    await HouseholdLead.findByIdAndUpdate(householdLeadId, {
      $inc: { totalMembers: 1 },
      isFull: householdLead.totalMembers + 1 >= householdLead.familyMembers,
    });

    // Populate details
    const populatedHouseholdMember = await HouseholdMember.findById(
      newHouseholdMember._id
    )
      .populate("userId", "fullName email contactNumber address")
      .populate("householdLeadId", "householdCode familyMembers totalMembers");

    res.status(201).json({
      success: true,
      message:
        "Household member registered successfully. Awaiting verification.",
      data: populatedHouseholdMember,
    });
  } catch (error) {
    console.error("Create household member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

exports.verifyHouseholdMember = AsyncErrorHandler(async (req, res) => {
  try {
    const { memberId, verificationCode } = req.body;

    const householdMember = await HouseholdMember.findById(memberId);
    if (!householdMember) {
      return res.status(404).json({
        success: false,
        message: "Household member not found",
      });
    }

    if (householdMember.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Household member is already verified",
      });
    }

    if (householdMember.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Verify the member
    householdMember.isVerified = true;
    householdMember.verificationCode = null;
    await householdMember.save();

    res.status(200).json({
      success: true,
      message: "Household member verified successfully",
      data: householdMember,
    });
  } catch (error) {
    console.error("Verify household member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

exports.getHouseholdMemberByUserId = AsyncErrorHandler(async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const householdMember = await HouseholdMember.findOne({ userId })
      .populate("userId", "fullName email contactNumber address")
      .populate("householdLeadId");

    if (!householdMember) {
      return res.status(404).json({
        success: false,
        message: "Household member profile not found",
      });
    }

    // Get household lead details
    const householdLead = await HouseholdLead.findById(
      householdMember.householdLeadId
    ).populate("userId", "fullName email contactNumber address barangay");

    res.status(200).json({
      success: true,
      data: {
        ...householdMember.toObject(),
        householdLeadDetails: householdLead,
      },
    });
  } catch (error) {
    console.error("Get household member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

exports.getHouseholdMembers = AsyncErrorHandler(async (req, res) => {
  try {
    const { householdLeadId } = req.query;
    if (!householdLeadId) {
      return res.status(400).json({
        success: false,
        message: "Household lead ID is required as a query parameter",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(householdLeadId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid household lead ID",
      });
    }

    // Get household lead with user details
    const householdLead = await HouseholdLead.findById(
      householdLeadId
    ).populate({
      path: "userId",
      select: "fullName email contactNumber address barangay",
    });

    if (!householdLead) {
      return res.status(404).json({
        success: false,
        message: "Household lead not found",
      });
    }

    // Get all household members with user details
    const householdMembers = await HouseholdMember.find({ householdLeadId })
      .populate("userId", "fullName email contactNumber address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        householdLead: householdLead,
        members: householdMembers,
        totalMembers: householdMembers.length + 1,
      },
    });
  } catch (error) {
    console.error("Get household members error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

exports.updateHouseholdMemberStatus = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isApproved } = req.body;

    // Hanapin ang household member
    const member = await HouseholdMember.findById(id);

    if (!member) {
      return res.status(404).json({
        status: "fail",
        message: "Household member not found",
      });
    }

    // Update lang kung ano ang pinasa
    if (typeof isActive === "boolean") {
      member.isActive = isActive;
    }

    if (typeof isApproved === "boolean") {
      member.isApproved = isApproved;
    }

    member.updatedAt = Date.now();

    await member.save();

    return res.status(200).json({
      status: "success",
      message: "Household member status updated successfully",
      data: member,
    });
  } catch (error) {
    console.error("Update Household Member Status Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

exports.updateHouseholdMember = AsyncErrorHandler(async (req, res) => {
  const memberId = req.params.id;
  const member = await HouseholdMember.findById(memberId);
  if (!member) {
    return res.status(404).json({
      status: "fail",
      message: "Household member not found",
    });
  }

  const memberAllowedFields = ["relationship", "disability", "birthDate"];
  const memberUpdateData = {};

  memberAllowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      memberUpdateData[field] = req.body[field];
    }
  });

  if (Object.keys(memberUpdateData).length > 0) {
    memberUpdateData.updatedAt = Date.now();

    await HouseholdMember.findByIdAndUpdate(memberId, memberUpdateData, {
      new: true,
      runValidators: true,
    });
  }

  const userId =
    typeof req.body.userId === "object"
      ? req.body.userId._id
      : req.body.userId;

  if (userId && req.body.userId && typeof req.body.userId === "object") {
    const userAllowedFields = ["fullName", "contactNumber", "address"];
    const userUpdateData = {};

    userAllowedFields.forEach((field) => {
      if (req.body.userId[field] !== undefined) {
        userUpdateData[field] = req.body.userId[field];
      }
    });


    if (Object.keys(userUpdateData).length > 0) {
      userUpdateData.updatedAt = Date.now();

      // DEBUG: Check if user exists first
      const checkUser = await UserLogin.findById(userId);

      if (checkUser) {
        const updatedUser = await UserLogin.findByIdAndUpdate(
          userId,
          { $set: userUpdateData },
          { new: true, runValidators: true }
        );
      } else {
        console.log("❌ UserLogin with this ID does not exist.");
      }
    }
  }

  /* ===============================
     RETURN UPDATED DATA
  ================================ */
  const updatedData = await HouseholdMember.findById(memberId).populate(
    "userId",
    "fullName contactNumber address"
  );

  res.status(200).json({
    status: "success",
    message: "Household member and user info updated successfully",
    data: updatedData,
  });
});

