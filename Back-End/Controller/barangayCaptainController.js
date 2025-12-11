// controllers/barangayCaptainController.js
const BarangayCaptain = require('../Models/BarangayCaptain');
const User = require('../models/User');
const Barangay = require('../models/Barangay');

// Create barangay captain profile
exports.createBarangayCaptain = async (req, res) => {
  try {
    const { userId, idNumber, organization, barangayName, termStart, termEnd } = req.body;

    // Check if user exists and has brgy_captain role
    const user = await User.findById(userId);
    if (!user || user.role !== 'brgy_captain') {
      return res.status(400).json({
        success: false,
        message: 'User not found or incorrect role'
      });
    }

    // Check if barangay captain profile already exists
    const existingBarangayCaptain = await BarangayCaptain.findOne({ userId });
    if (existingBarangayCaptain) {
      return res.status(400).json({
        success: false,
        message: 'Barangay captain profile already exists for this user'
      });
    }

    // Check if ID number already exists
    const existingIdNumber = await BarangayCaptain.findOne({ idNumber });
    if (existingIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'ID number already exists'
      });
    }

    // Check if barangay already has a captain
    const existingBarangayCaptainForBarangay = await BarangayCaptain.findOne({ barangayName });
    if (existingBarangayCaptainForBarangay) {
      return res.status(400).json({
        success: false,
        message: 'Barangay already has a captain assigned'
      });
    }

    // Create new barangay captain
    const newBarangayCaptain = new BarangayCaptain({
      userId,
      idNumber,
      organization,
      barangayName,
      termStart: termStart || new Date(),
      termEnd
    });

    await newBarangayCaptain.save();

    // Update user's barangay field
    await User.findByIdAndUpdate(userId, { barangay: barangayName });

    // Update barangay record with captain
    await Barangay.findOneAndUpdate(
      { name: barangayName },
      { $set: { barangayCaptainId: newBarangayCaptain._id } }
    );

    // Populate user details
    const populatedBarangayCaptain = await BarangayCaptain.findById(newBarangayCaptain._id)
      .populate('userId', 'fullName email contactNumber address');

    res.status(201).json({
      success: true,
      message: 'Barangay captain profile created successfully',
      data: populatedBarangayCaptain
    });
  } catch (error) {
    console.error('Create barangay captain error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get barangay captain by user ID
exports.getBarangayCaptainByUserId = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const barangayCaptain = await BarangayCaptain.findOne({ userId })
      .populate('userId', 'fullName email contactNumber address barangay');

    if (!barangayCaptain) {
      return res.status(404).json({
        success: false,
        message: 'Barangay captain profile not found'
      });
    }

    // Get barangay information
    const barangay = await Barangay.findOne({ name: barangayCaptain.barangayName });

    res.status(200).json({
      success: true,
      data: {
        ...barangayCaptain.toObject(),
        barangayInfo: barangay
      }
    });
  } catch (error) {
    console.error('Get barangay captain error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get barangay captain by barangay name
exports.getBarangayCaptainByBarangay = async (req, res) => {
  try {
    const { barangayName } = req.params;

    const barangayCaptain = await BarangayCaptain.findOne({ barangayName })
      .populate('userId', 'fullName email contactNumber address');

    if (!barangayCaptain) {
      return res.status(404).json({
        success: false,
        message: 'No barangay captain found for this barangay'
      });
    }

    res.status(200).json({
      success: true,
      data: barangayCaptain
    });
  } catch (error) {
    console.error('Get barangay captain by barangay error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update barangay captain profile
exports.updateBarangayCaptain = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { idNumber, organization, barangayName, termEnd } = req.body;

    // Check if barangay captain exists
    const barangayCaptain = await BarangayCaptain.findOne({ userId });
    if (!barangayCaptain) {
      return res.status(404).json({
        success: false,
        message: 'Barangay captain profile not found'
      });
    }

    // Check if new ID number already exists (if changing)
    if (idNumber && idNumber !== barangayCaptain.idNumber) {
      const existingIdNumber = await BarangayCaptain.findOne({ idNumber });
      if (existingIdNumber) {
        return res.status(400).json({
          success: false,
          message: 'ID number already exists'
        });
      }
    }

    const updateData = {};
    if (idNumber) updateData.idNumber = idNumber;
    if (organization) updateData.organization = organization;
    if (termEnd) updateData.termEnd = termEnd;

    // If changing barangay
    if (barangayName && barangayName !== barangayCaptain.barangayName) {
      // Check if new barangay already has a captain
      const existingBarangayCaptain = await BarangayCaptain.findOne({ barangayName });
      if (existingBarangayCaptain) {
        return res.status(400).json({
          success: false,
          message: 'Barangay already has a captain assigned'
        });
      }

      updateData.barangayName = barangayName;
      
      // Update user's barangay
      await User.findByIdAndUpdate(userId, { barangay: barangayName });

      // Update barangay records
      await Barangay.findOneAndUpdate(
        { name: barangayCaptain.barangayName },
        { $unset: { barangayCaptainId: "" } }
      );
      
      await Barangay.findOneAndUpdate(
        { name: barangayName },
        { $set: { barangayCaptainId: barangayCaptain._id } }
      );
    }

    const updatedBarangayCaptain = await BarangayCaptain.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email contactNumber address barangay');

    res.status(200).json({
      success: true,
      message: 'Barangay captain profile updated successfully',
      data: updatedBarangayCaptain
    });
  } catch (error) {
    console.error('Update barangay captain error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};