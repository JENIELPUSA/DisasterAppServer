const Rescuer = require('../Models/Rescuer');
const User = require('../Models/UserModel');

// Create rescuer profile
exports.createRescuer = async (req, res) => {
  try {
    const { userId, organization, idNumber, specialization, availability } = req.body;

    // Check if user exists and has rescuer role
    const user = await User.findById(userId);
    if (!user || user.role !== 'rescuer') {
      return res.status(400).json({
        success: false,
        message: 'User not found or incorrect role'
      });
    }

    // Check if rescuer profile already exists
    const existingRescuer = await Rescuer.findOne({ userId });
    if (existingRescuer) {
      return res.status(400).json({
        success: false,
        message: 'Rescuer profile already exists for this user'
      });
    }

    // Check if ID number already exists
    const existingIdNumber = await Rescuer.findOne({ idNumber });
    if (existingIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'ID number already exists'
      });
    }

    // Create new rescuer
    const newRescuer = new Rescuer({
      userId,
      organization,
      idNumber,
      specialization: specialization || 'other',
      availability: availability !== undefined ? availability : true
    });

    await newRescuer.save();

    // Populate user details
    const populatedRescuer = await Rescuer.findById(newRescuer._id)
      .populate('userId', 'fullName email contactNumber address');

    res.status(201).json({
      success: true,
      message: 'Rescuer profile created successfully',
      data: populatedRescuer
    });
  } catch (error) {
    console.error('Create rescuer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get rescuer by user ID
exports.getRescuerByUserId = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const rescuer = await Rescuer.findOne({ userId })
      .populate('userId', 'fullName email contactNumber address barangay');

    if (!rescuer) {
      return res.status(404).json({
        success: false,
        message: 'Rescuer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rescuer
    });
  } catch (error) {
    console.error('Get rescuer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update rescuer profile
exports.updateRescuer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { organization, idNumber, specialization, availability } = req.body;

    // Check if rescuer exists
    const rescuer = await Rescuer.findOne({ userId });
    if (!rescuer) {
      return res.status(404).json({
        success: false,
        message: 'Rescuer profile not found'
      });
    }

    // Check if new ID number already exists (if changing)
    if (idNumber && idNumber !== rescuer.idNumber) {
      const existingIdNumber = await Rescuer.findOne({ idNumber });
      if (existingIdNumber) {
        return res.status(400).json({
          success: false,
          message: 'ID number already exists'
        });
      }
    }

    const updateData = {};
    if (organization) updateData.organization = organization;
    if (idNumber) updateData.idNumber = idNumber;
    if (specialization) updateData.specialization = specialization;
    if (availability !== undefined) updateData.availability = availability;

    const updatedRescuer = await Rescuer.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email contactNumber address');

    res.status(200).json({
      success: true,
      message: 'Rescuer profile updated successfully',
      data: updatedRescuer
    });
  } catch (error) {
    console.error('Update rescuer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all rescuers
exports.getAllRescuers = async (req, res) => {
  try {
    const { availability, specialization, barangay } = req.query;
    
    let filter = {};
    if (availability !== undefined) filter.availability = availability === 'true';
    if (specialization) filter.specialization = specialization;

    // If barangay filter, need to join with User
    if (barangay) {
      const usersInBarangay = await User.find({ barangay }).select('_id');
      const userIds = usersInBarangay.map(user => user._id);
      filter.userId = { $in: userIds };
    }

    const rescuers = await Rescuer.find(filter)
      .populate('userId', 'fullName email contactNumber address barangay')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rescuers.length,
      data: rescuers
    });
  } catch (error) {
    console.error('Get all rescuers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get available rescuers for emergency
exports.getAvailableRescuers = async (req, res) => {
  try {
    const { barangay } = req.query;

    let userFilter = {};
    if (barangay) userFilter.barangay = barangay;

    const availableUsers = await User.find({ 
      ...userFilter, 
      role: 'rescuer',
      isActive: true 
    }).select('_id');

    const userIds = availableUsers.map(user => user._id);

    const availableRescuers = await Rescuer.find({
      userId: { $in: userIds },
      availability: true
    })
    .populate('userId', 'fullName contactNumber address barangay')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: availableRescuers.length,
      data: availableRescuers
    });
  } catch (error) {
    console.error('Get available rescuers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};