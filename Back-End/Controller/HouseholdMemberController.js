const HouseholdMember = require('../Models/HouseholdMember');
const HouseholdLead = require('../Models/HouseholdLead');
const User = require('../models/User');

// Create household member profile
exports.createHouseholdMember = async (req, res) => {
  try {
    const { userId, householdLeadId, relationship, householdAddress, householdLeadName } = req.body;

    // Check if user exists and has household_member role
    const user = await User.findById(userId);
    if (!user || user.role !== 'household_member') {
      return res.status(400).json({
        success: false,
        message: 'User not found or incorrect role'
      });
    }

    // Check if household member profile already exists
    const existingHouseholdMember = await HouseholdMember.findOne({ userId });
    if (existingHouseholdMember) {
      return res.status(400).json({
        success: false,
        message: 'Household member profile already exists for this user'
      });
    }

    // Check if household lead exists and is not full
    const householdLead = await HouseholdLead.findById(householdLeadId);
    if (!householdLead) {
      return res.status(404).json({
        success: false,
        message: 'Household lead not found'
      });
    }

    if (householdLead.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Household is already full'
      });
    }

    // Check if family members limit is reached
    if (householdLead.totalMembers >= householdLead.familyMembers) {
      await HouseholdLead.findByIdAndUpdate(householdLeadId, { isFull: true });
      return res.status(400).json({
        success: false,
        message: 'Household has reached maximum members'
      });
    }

    // Generate verification code
    const verificationCode = Math.random().toString(36).substr(2, 6).toUpperCase();

    // Create new household member
    const newHouseholdMember = new HouseholdMember({
      userId,
      householdLeadId,
      relationship,
      householdAddress,
      householdLeadName,
      verificationCode,
      isVerified: false
    });

    await newHouseholdMember.save();

    // Update household lead total members
    await HouseholdLead.findByIdAndUpdate(
      householdLeadId,
      { 
        $inc: { totalMembers: 1 },
        isFull: householdLead.totalMembers + 1 >= householdLead.familyMembers
      }
    );

    // Populate details
    const populatedHouseholdMember = await HouseholdMember.findById(newHouseholdMember._id)
      .populate('userId', 'fullName email contactNumber address')
      .populate('householdLeadId', 'householdCode familyMembers totalMembers');

    res.status(201).json({
      success: true,
      message: 'Household member registered successfully. Awaiting verification.',
      data: populatedHouseholdMember
    });
  } catch (error) {
    console.error('Create household member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Verify household member
exports.verifyHouseholdMember = async (req, res) => {
  try {
    const { memberId, verificationCode } = req.body;

    const householdMember = await HouseholdMember.findById(memberId);
    if (!householdMember) {
      return res.status(404).json({
        success: false,
        message: 'Household member not found'
      });
    }

    if (householdMember.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Household member is already verified'
      });
    }

    if (householdMember.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Verify the member
    householdMember.isVerified = true;
    householdMember.verificationCode = null;
    await householdMember.save();

    res.status(200).json({
      success: true,
      message: 'Household member verified successfully',
      data: householdMember
    });
  } catch (error) {
    console.error('Verify household member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get household member by user ID
exports.getHouseholdMemberByUserId = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const householdMember = await HouseholdMember.findOne({ userId })
      .populate('userId', 'fullName email contactNumber address')
      .populate('householdLeadId');

    if (!householdMember) {
      return res.status(404).json({
        success: false,
        message: 'Household member profile not found'
      });
    }

    // Get household lead details
    const householdLead = await HouseholdLead.findById(householdMember.householdLeadId)
      .populate('userId', 'fullName email contactNumber address barangay');

    res.status(200).json({
      success: true,
      data: {
        ...householdMember.toObject(),
        householdLeadDetails: householdLead
      }
    });
  } catch (error) {
    console.error('Get household member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all members of a household
exports.getHouseholdMembers = async (req, res) => {
  try {
    const { householdLeadId } = req.params;

    const householdMembers = await HouseholdMember.find({ householdLeadId })
      .populate('userId', 'fullName email contactNumber address')
      .sort({ createdAt: -1 });

    // Get household lead info
    const householdLead = await HouseholdLead.findById(householdLeadId)
      .populate('userId', 'fullName email contactNumber address barangay');

    res.status(200).json({
      success: true,
      data: {
        householdLead: householdLead,
        members: householdMembers,
        totalMembers: householdMembers.length + 1 // +1 for the lead
      }
    });
  } catch (error) {
    console.error('Get household members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update household member profile
exports.updateHouseholdMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { relationship } = req.body;

    // Check if household member exists
    const householdMember = await HouseholdMember.findOne({ userId });
    if (!householdMember) {
      return res.status(404).json({
        success: false,
        message: 'Household member profile not found'
      });
    }

    const updateData = {};
    if (relationship) updateData.relationship = relationship;

    const updatedHouseholdMember = await HouseholdMember.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('userId', 'fullName email contactNumber address')
    .populate('householdLeadId');

    res.status(200).json({
      success: true,
      message: 'Household member profile updated successfully',
      data: updatedHouseholdMember
    });
  } catch (error) {
    console.error('Update household member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove household member
exports.removeHouseholdMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const householdMember = await HouseholdMember.findById(memberId);
    if (!householdMember) {
      return res.status(404).json({
        success: false,
        message: 'Household member not found'
      });
    }

    // Decrease household lead total members
    await HouseholdLead.findByIdAndUpdate(
      householdMember.householdLeadId,
      { 
        $inc: { totalMembers: -1 },
        isFull: false
      }
    );

    // Delete household member
    await HouseholdMember.findByIdAndDelete(memberId);

    // Update user role if needed
    await User.findByIdAndUpdate(householdMember.userId, { role: 'user' });

    res.status(200).json({
      success: true,
      message: 'Household member removed successfully'
    });
  } catch (error) {
    console.error('Remove household member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

