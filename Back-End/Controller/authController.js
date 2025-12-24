const UserLogin = require("../Models/LogInSchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const streamifier = require("streamifier");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");
const util = require("util");
const Rescuer = require("../Models/Rescuer");
const HouseholdLead = require("../Models/HouseholdLead");
const BarangayCaptain = require("../Models/BarangayCaptain");
const Barangay = require("../Models/Barangay");
const HouseholdMember = require("../Models/HouseholdMember");
const crypto = require("crypto");
const sendEmail = require("./../Utils/email");
const cloudinary = require("../Utils/cloudinary");
const signToken = (id, role, linkId) => {
  return jwt.sign({ id, role, linkId }, process.env.SECRET_STR, {
    expiresIn: "12h",
  });
};

exports.signup = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      // Common fields
      fullName,
      email,
      password,
      contactNumber,
      address,
      role,
      barangayName,

      // Role-specific fields
      organization,
      idNumber,
      familyMembers,
      householdLeadId,
      relationship,
      householdLeadName,
      householdAddress,
      disability,
      birthDate,
      
      // GPS coordinates for household_lead
      latitude,
      longitude,
      gpsCoordinates,
      emergencyContact,
    } = req.body;

    console.log("➡ Backend received data:", { 
      role,
      barangayName,
      latitude,
      longitude,
      gpsCoordinates,
      familyMembers
    });

    // Check if user already exists
    const existingUser = await UserLogin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists!",
      });
    }

    let avatar = null;

    if (req.file) {
      try {
        console.time("UploadAvatar");

        const uploadFromBuffer = (buffer) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "EMERGENCY_SYSTEM/Profile" },
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

        console.timeEnd("UploadAvatar");
      } catch (uploadErr) {
        console.error("❌ Avatar upload failed:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Failed to upload avatar.",
          error: uploadErr.message,
        });
      }
    }

    // Role model mapping
    const roleModelMap = {
      rescuer: Rescuer,
      household_lead: HouseholdLead,
      brgy_captain: BarangayCaptain,
      household_member: HouseholdMember,
    };

    const ProfileModel = roleModelMap[role];
    if (!ProfileModel) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role provided. Must be 'rescuer', 'household_lead', 'brgy_captain', or 'household_member'.",
      });
    }

    // Create User document
    const newUser = await UserLogin.create({
      fullName,
      username: email,
      password,
      contactNumber,
      address,
      role,
      barangay: ["household_lead", "brgy_captain"].includes(role)
        ? barangayName
        : undefined,
      isVerified: true,
      avatar: avatar?.url || null,
    });

    let linkedRecord = null;
    let verificationCode = null;
    let locationInfo = null; // Add this variable for location info

    // ROLE SPECIFIC CREATION
    switch (role) {
      // ------------------- RESCUER -------------------
      case "rescuer":
        linkedRecord = await Rescuer.create({
          userId: newUser._id,
          organization,
          idNumber,
          specialization: "other",
          availability: true,
        });
        break;

      // ------------------- HOUSEHOLD LEAD -------------------
      case "household_lead":
        console.log("Creating household lead with data:", {
          userId: newUser._id,
          barangayName,
          familyMembers,
          latitude,
          longitude,
          gpsCoordinates,
          emergencyContact
        });

        // Parse GPS coordinates
        let lat, lng;
        
        if (latitude && longitude) {
          lat = parseFloat(latitude);
          lng = parseFloat(longitude);
          console.log("Using separate lat/long:", lat, lng);
        } else if (gpsCoordinates) {
          // Parse "latitude,longitude" string
          const coords = gpsCoordinates.split(',');
          if (coords.length >= 2) {
            lat = parseFloat(coords[0].trim());
            lng = parseFloat(coords[1].trim());
            console.log("Parsed from gpsCoordinates:", lat, lng);
          }
        }

        // Check if valid coordinates
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          await UserLogin.findByIdAndDelete(newUser._id);
          return res.status(400).json({
            success: false,
            message: "Valid GPS coordinates (latitude and longitude) are required for household lead registration",
          });
        }

        // Check barangay if provided
        let barangayId = null;
        if (barangayName) {
          const barangayExists = await Barangay.findById(barangayName);
          if (!barangayExists) {
            await UserLogin.findByIdAndDelete(newUser._id);
            return res.status(400).json({
              success: false,
              message: "Barangay not found",
            });
          }
          barangayId = barangayName;
        }

        // Create household lead with location
        const householdLeadData = {
          userId: newUser._id,
          barangayId: barangayId,
          familyMembers: parseInt(familyMembers) || 1,
          emergencyContact: emergencyContact || contactNumber || "",
          totalMembers: 1,
          location: {
            latitude: lat,
            longitude: lng
          },
          isActive: true
        };

        console.log("Creating HouseholdLead with data:", householdLeadData);
        
        linkedRecord = await HouseholdLead.create(householdLeadData);
        console.log("Household lead created successfully:", linkedRecord._id);
        
        // Store location info for response
        locationInfo = {
          hasLocation: true,
          coordinates: `${lat},${lng}`,
          latitude: lat,
          longitude: lng,
          barangayId: barangayId
        };
        break;

      // ------------------- BARANGAY CAPTAIN -------------------
      case "brgy_captain":
        // Check if ID number already exists
        const existingCaptainId = await BarangayCaptain.findOne({ idNumber });
        if (existingCaptainId) {
          await UserLogin.findByIdAndDelete(newUser._id);
          return res.status(400).json({
            success: false,
            message: "ID number already exists",
          });
        }

        linkedRecord = await BarangayCaptain.create({
          userId: newUser._id,
          idNumber,
          organization,
          barangayName: barangayName,
          termStart: new Date(),
        });

        // Assign captain to Barangay
        await Barangay.findByIdAndUpdate(barangayName, {
          $set: { barangayCaptainId: linkedRecord._id },
        });

        break;

      // ------------------- HOUSEHOLD MEMBER -------------------
      case "household_member":
        const householdLead = await HouseholdLead.findById(householdLeadId);
        if (!householdLead) {
          await UserLogin.findByIdAndDelete(newUser._id);
          return res.status(404).json({
            success: false,
            message: "Household lead not found",
          });
        }

        if (
          householdLead.isFull ||
          householdLead.totalMembers >= householdLead.familyMembers
        ) {
          await UserLogin.findByIdAndDelete(newUser._id);
          return res.status(400).json({
            success: false,
            message: "Household is full",
          });
        }

        verificationCode = Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase();

        linkedRecord = await HouseholdMember.create({
          userId: newUser._id,
          householdLeadId,
          relationship,
          householdLeadName,
          verificationCode,
          disability,
          birthDate,
          isVerified: false,
        });

        await HouseholdLead.findByIdAndUpdate(householdLeadId, {
          $inc: { totalMembers: 1 },
          isFull: householdLead.totalMembers + 1 >= householdLead.familyMembers,
        });

        const leadUser = await UserLogin.findById(householdLead.userId);
        if (leadUser) {
          await sendEmail({
            email: leadUser.email,
            subject: "New Household Member Registration",
            text: `A new member (${fullName}) has registered under your household.\nRelationship: ${relationship}\nVerification Code: ${verificationCode}`,
          });
        }

        break;

      default:
        await UserLogin.findByIdAndDelete(newUser._id);
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
    }

    // Link profile record
    newUser.linkedId = linkedRecord._id;
    await newUser.save();

    // Generate token
    const token = signToken(newUser._id, newUser.role, linkedRecord._id);

    // Send welcome email (optional)
    try {
      await sendEmail({
        email: newUser.email,
        subject: "Welcome to Emergency Response System",
        text: `Welcome ${fullName}! Your account has been created.\nRole: ${role}`,
      });
    } catch (emailErr) {
      console.warn("Failed to send welcome email:", emailErr);
    }

    console.timeEnd("RegistrationProcess");

    // Prepare response data
    const response = {
      success: true,
      message: "Registration completed successfully",
      data: {
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          linkedId: linkedRecord._id,
          contactNumber: newUser.contactNumber,
          address: newUser.address,
          avatar: newUser.avatar,
        },
        roleProfile: linkedRecord,
        token,
      },
    };

    // Add location info for household_lead
    if (role === "household_lead" && locationInfo) {
      response.data.locationInfo = locationInfo;
      response.message = "Household lead registration successful with GPS location.";
    }

    if (role === "household_member") {
      response.message =
        "Registration completed. Awaiting verification from household lead.";
      response.data.verificationRequired = true;
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error("Registration Error:", error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
        error: error.message
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value for ${field}. Please use a different value.`,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration.",
      error: error.message,
    });
  }
});

exports.login = AsyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserLogin.findOne({ username: email }).select("+password");

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    return next(new CustomError("Incorrect email or password", 400));
  }

  if (!user.isVerified) {
    return res.status(401).json({
      message: "Please verify your email address before logging in.",
    });
  }

  let linkId = user.linkedId || user._id;
  let zone = user.Designatedzone;

  if (user.role === "patient") {
    const patient = await Patient.findOne({ user_id: user._id });
    if (patient) {
      linkId = patient._id;
      zone = patient.zone;
    }
  }

  //Generate token with role and linkId
  const token = signToken(user._id, user.role, linkId);

  req.session.userId = user._id;
  req.session.isLoggedIn = true;
  req.session.user = {
    email: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    Designatedzone: zone,
    linkId,
    theme: user.theme,
  };

  return res.status(200).json({
    status: "Success",
    userId: user._id,
    linkId,
    role: user.role,
    token,
    email: user.username,
    Designatedzone: zone,
    first_name: user.first_name,
    last_name: user.last_name,
    theme: user.theme,
  });
});

exports.logout = AsyncErrorHandler((req, res, next) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed.");
    res.clearCookie("connect.sid");
    res.send("Logged out successfully!");
  });
});

exports.verifyOtp = AsyncErrorHandler(async (req, res, next) => {
  const { otp, userId } = req.body;

  if (!otp || !userId) {
    return res.status(400).json({
      message: "Both OTP and userId are required.",
    });
  }

  const user = await UserLogin.findById(userId);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified" });
  }
  if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  return res.status(200).json({
    message: "Email Verified Successfully",
    data: {
      _id: user._id,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

exports.login = AsyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserLogin.findOne({ username: email }).select("+password");

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    return next(new CustomError("Incorrect email or password", 400));
  }

  if (!user.isVerified) {
    return res.status(401).json({
      message: "Please verify your email address before logging in.",
    });
  }

  let linkId = user.linkedId || user._id;
  let zone = user.Designatedzone;

  if (user.role === "patient") {
    const patient = await Patient.findOne({ user_id: user._id });
    if (patient) {
      linkId = patient._id;
      zone = patient.zone;
    }
  }

  const token = signToken(user._id, user.role, linkId);

  req.session.userId = user._id;
  req.session.isLoggedIn = true;
  req.session.user = {
    email: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    Designatedzone: zone,
    linkId,
  };

  return res.status(200).json({
    status: "Success",
    userId: user._id,
    linkId,
    role: user.role,
    token,
    email: user.username,
    Designatedzone: zone,
    first_name: user.first_name,
    last_name: user.last_name,
  });
});

exports.protect = AsyncErrorHandler(async (req, res, next) => {
  // 1. Check if user is logged in via session
  if (req.session && req.session.isLoggedIn && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // 2. If no session, fallback to token (JWT) authentication
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new CustomError("You are not logged in!", 401));
  }

  // 3. Verify JWT token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  const user = await UserLogin.findById(decoded.id);
  if (!user) {
    return next(new CustomError("User no longer exists", 401));
  }

  // 4. Check if password changed after token was issued
  const isPasswordChanged = await user.isPasswordChanged(decoded.iat);
  if (isPasswordChanged) {
    return next(new CustomError("Password changed. Login again.", 401));
  }

  // 5. Set linkedId and assign user to req.user
  const linkId = user.linkedId || user._id;

  const userData = {
    _id: user._id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    linkId,
  };

  // 6. Store to session for future requests
  req.session.user = userData;
  req.session.isLoggedIn = true;
  req.user = userData;

  next();
});

exports.restrict = (role) => {
  return (req, res, next) => {
    if (!req.session?.isLoggedIn || req.session.user.role !== role) {
      return res
        .status(403)
        .json({ message: `Access denied. Role required: ${role}` });
    }
    next();
  };
};

exports.forgotPassword = AsyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await UserLogin.findOne({ username: email });

  // If user doesn't exist, return 404
  if (!user) {
    return next(
      new CustomError("We could  not find the user with given email", 404)
    );
  }

  // Generate a password reset token
  const resetToken = user.createResetTokenPassword();
  await user.save({ validateBeforeSave: false });

  // Generate reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `We have received a password reset request. Please use the below link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

  try {
    // Send password reset email
    await sendEmail({
      email: user.username, // use username field since it holds the email
      subject: "Password change request received",
      text: message,
    });

    // Respond with success
    res.status(200).json({
      status: "Success",
      message: "Password reset link sent to the user email",
    });
  } catch (err) {
    // Clean up if sending fails
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        "There was an error sending password reset email. Please try again later",
        500
      )
    );
  }
});

exports.resetPassword = AsyncErrorHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserLogin.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Invalid or expired token.", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  return res.status(200).json({
    status: "Success",
  });
});

exports.updatePassword = AsyncErrorHandler(async (req, res, next) => {
  const user = await UserLogin.findById(req.user._id).select("+password");

  if (!user) {
    return next(new CustomError("User not found.", 404));
  }

  const isMatch = await user.comparePasswordInDb(
    req.body.currentPassword,
    user.password
  );
  if (!isMatch) {
    return next(
      new CustomError("The current password you provided is wrong", 401)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});
