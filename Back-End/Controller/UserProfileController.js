const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const UserProfile = require("../Models/PersonSchema");
const mongoose = require("mongoose");
const cloudinary = require("../Utils/cloudinary");
const streamifier = require("streamifier");

exports.createUserProfile = AsyncErrorHandler(async (req, res) => {
  const {
    name,
    position,
    biography,
    colortheme,
    socialLinks,
    contactInfo,
    termTo,
    termFrom,
    fontColor,
  } = req.body;

  const socialLinksObj =
    typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
  const contactInfoObj =
    typeof contactInfo === "string" ? JSON.parse(contactInfo) : contactInfo;

  let avatar = {};

  // Kung may file na na-upload, i-upload ito sa cloudinary
  if (req.file) {
    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "LGU_EVENT_MANAGEMENT/Profile" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const uploadedResponse = await uploadFromBuffer(req.file.buffer);
    avatar = {
      public_id: uploadedResponse.public_id,
      url: uploadedResponse.secure_url,
    };
  }

  // Ngayon, gumawa ng bagong user profile kasama ang avatar kung available
  const newProfile = await UserProfile.create({
    name,
    position,
    biography,
    colortheme,
    fontColor,
    socialLinks: socialLinksObj,
    contactInfo: contactInfoObj,
    termTo,
    termFrom,
    avatar, // idagdag ang avatar object
  });

  res.status(201).json({
    status: "success",
    data: newProfile,
  });
});

exports.getAllUserProfiles = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const { termFrom, termTo, position } = req.query;
  const filter = {};
  if (position && position.trim() !== "") {
    filter.position = position;
  }

  if (termFrom && termFrom.trim() !== "") {
    filter.termFrom = parseInt(termFrom);
  }

  if (termTo && termTo.trim() !== "") {
    filter.termTo = parseInt(termTo);
  }

  console.log('Filter:', JSON.stringify(filter, null, 2));

  try {
    const totalProfiles = await UserProfile.countDocuments(filter);
    const totalPages = Math.ceil(totalProfiles / limit);
    const skip = (page - 1) * limit;

    const profiles = await UserProfile.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      currentPage: page,
      totalPages,
      results: profiles.length,
      totalResults: totalProfiles,
      data: profiles,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      status: "error",
      message: "Error fetching profiles",
      error: error.message
    });
  }
});

exports.getUserProfileByPosition = AsyncErrorHandler(async (req, res) => {
  const { position } = req.params;
  if (!position || position === "undefined" || position === "null") {
    return res.status(400).json({
      message: "Position is required",
      receivedPosition: position,
    });
  }

  const currentYear = new Date().getFullYear();
  try {
    // Kunin ang latest profile na pasok sa current year
    const profile = await UserProfile.findOne({
      position: position,
      termFrom: { $lte: currentYear },
      termTo: { $gte: currentYear },
    }).sort({ termFrom: -1 });

    if (!profile) {
      return res.status(404).json({
        message: "No active profile found for this position in current term",
        position: position,
        currentYear: currentYear,
      });
    }

    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    console.error("Backend - Database error:", error);
    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});

exports.updateUserProfile = AsyncErrorHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Check if profile exists
    const existingProfile = await UserProfile.findById(id);
    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let avatar = existingProfile.avatar; // Keep existing avatar by default

    // Upload new image if provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (existingProfile.avatar && existingProfile.avatar.public_id) {
          await cloudinary.uploader.destroy(existingProfile.avatar.public_id);
        }

        // Upload new image
        const base64Image = `data:${
          req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;
        const uploadedResponse = await cloudinary.uploader.upload(base64Image, {
          folder: "LGU_EVENT_MANAGEMENT/Profile",
        });

        avatar = {
          public_id: uploadedResponse.public_id,
          url: uploadedResponse.secure_url,
        };
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // Parse JSON fields if they are sent as strings
    let socialLinks, contactInfo;
    try {
      socialLinks =
        typeof req.body.socialLinks === "string"
          ? JSON.parse(req.body.socialLinks)
          : req.body.socialLinks;

      contactInfo =
        typeof req.body.contactInfo === "string"
          ? JSON.parse(req.body.contactInfo)
          : req.body.contactInfo;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res
        .status(400)
        .json({ message: "Invalid JSON in socialLinks or contactInfo" });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      position: req.body.position,
      biography: req.body.biography,
      colortheme: req.body.colortheme,
      termFrom: req.body.termFrom,
      termTo: req.body.termTo,
      fontColor: req.body.fontColor,
      avatar,
      ...(socialLinks !== undefined && { socialLinks }),
      ...(contactInfo !== undefined && { contactInfo }),
    };

    // Update the profile
    const updatedProfile = await UserProfile.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ message: "Profile not found after update" });
    }

    res.status(200).json({
      status: "success",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    // Avoid exposing raw error in production
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while updating the profile",
    });
  }
});

exports.deleteUserProfile = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const deletedProfile = await UserProfile.findByIdAndDelete(id);
  if (!deletedProfile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getCurrentMayorProfile = AsyncErrorHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();

  try {
    const profile = await UserProfile.findOne(
      {
        position: "Mayor",
        termFrom: { $lte: currentYear },
        termTo: { $gte: currentYear },
      },
      "colortheme fontColor" // <-- include both
    ).sort({ termFrom: -1 });

    if (!profile) {
      return res.status(404).json({
        message: "No active Mayor profile found for the current term",
        currentYear,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        colortheme: profile.colortheme,
        fontColor: profile.fontColor,
      },
    });
  } catch (error) {
    console.error("Backend - Database error:", error);
    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});

