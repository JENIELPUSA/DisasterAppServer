const UserLogin = require("../Models/LogInSchema");
const Admin = require("../Models/AdminSchema");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const streamifier = require("streamifier");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");
const util = require("util");
const crypto = require("crypto");
const sendEmail = require("./../Utils/email");
const cloudinary = require("../Utils/cloudinary");
const Organizer = require("../Models/OrganizerModel");
const signToken = (id, role, linkId) => {
  return jwt.sign({ id, role, linkId }, process.env.SECRET_STR, {
    expiresIn: "12h",
  });
};

exports.signup = AsyncErrorHandler(async (req, res) => {
  try {
    const {
      contact_number,
      first_name,
      last_name,
      email,
      role,
      extention,
      gender,
      middle_name,
    } = req.body;

    const generateRandomPassword = () => {
      const prefix = "user122";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
      let randomPart = "";
      for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return prefix + randomPart;
    };

    const defaultPassword = generateRandomPassword();
    const modelMap = {
      admin: Admin,
      organizer: Organizer,
      staff: Officer,
      lgu: Lgu, // <-- fixed here
    };

    const ProfileModel = modelMap[role];
    if (!ProfileModel) {
      return res.status(400).json({
        message: "Invalid role provided. Must be 'admin', 'staff', 'organizer', or 'lgu'.",
      });
    }

    const requiredFields = ["first_name", "last_name", "email"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const existingUser = await UserLogin.findOne({ username: email });
    if (existingUser) {
      return res.status(400).json({
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

        console.timeEnd("UploadAvatar");
      } catch (uploadErr) {
        console.error("❌ Avatar upload failed:", uploadErr);
        return res.status(500).json({
          message: "Failed to upload avatar.",
          error: uploadErr.message,
        });
      }
    }

    const commonFields = {
      avatar,
      first_name,
      last_name,
      middle_name,
      email,
      extention,
      contact_number,
      gender,
    };

    const linkedRecord = await ProfileModel.create(commonFields);

    const [newUserLogin] = await Promise.all([
      UserLogin.create({
        avatar: avatar?.url || null,
        first_name,
        last_name,
        username: email,
        contact_number,
        password: defaultPassword,
        role,
        linkedId: linkedRecord._id,
        isVerified: true,
      }),
      sendEmail({
        email,
        subject: "Your Account Credentials",
        text: `Welcome to the system!\n\nYour account has been created successfully.\n\nDefault Password: ${defaultPassword}\n\nPlease change your password after logging in.`,
      }),
    ]);

    console.timeEnd("SignupProcess");

    return res.status(201).json({
      status: "success",
      user: newUserLogin,
      profile: linkedRecord,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      message: "Something went wrong during signup.",
      error: error.message,
    });
  }
});

const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    maxAge: process.env.LOGIN_EXPR,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };

  res.cookie("jwt", token, options);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};



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
