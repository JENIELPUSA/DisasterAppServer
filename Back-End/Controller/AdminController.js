const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Admin = require("../Models/AdminSchema");
const Apifeatures = require("../Utils/ApiFeatures");
const UserLoginSchema = require("../Models/LogInSchema");
const cloudinary = require("../Utils/cloudinary");
const LogInSchema = require("../Models/LogInSchema");

exports.updateAdmin = async (req, res) => {
  const adminId = req.params.id;

  console.log(req.body);
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    let avatar = admin.avatar;
    if (req.file) {
      if (admin.avatar?.public_id) {
        try {
          await cloudinary.uploader.destroy(admin.avatar.public_id);
        } catch (err) {
          console.error("Failed to delete old image from Cloudinary", err);
        }
      }

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
    }

    // Build update object dynamically, only include fields with values
    const adminUpdate = { avatar }; // always include avatar if changed
    const fields = [
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "gender",
      "contact_number",
    ];
    fields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field].trim() !== ""
      ) {
        adminUpdate[field] = req.body[field];
      }
    });

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, adminUpdate, {
      new: true,
    });

    // Update corresponding LogInSchema document
    const loginUpdate = {};
    ["first_name", "last_name", "contact_number"].forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field].trim() !== ""
      ) {
        loginUpdate[field] = req.body[field];
      }
    });
    if (avatar) loginUpdate.avatar = avatar; // optional avatar update

    const updatedLogIn = await LogInSchema.findOneAndUpdate(
      { linkedId: adminId },
      loginUpdate,
      { new: true }
    );

    res.json({
      status: "success",
      admin: updatedAdmin,
      login: updatedLogIn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.deleteAdmin = AsyncErrorHandler(async (req, res, next) => {
  const AdminID = req.params.id;

  const existingAdmin = await Admin.findById(AdminID);
  if (!existingAdmin) {
    return res.status(404).json({
      status: "fail",
      message: "Officer not found.",
    });
  }

  if (existingAdmin.avatar && existingAdmin.avatar.public_id) {
    try {
      await cloudinary.uploader.destroy(existingAdmin.avatar.public_id);
    } catch (error) {
      console.error("Cloudinary deletion failed:", error);
      // optionally continue even if deletion fails
    }
  }

  // 🗑 Delete linked login
  const userLogin = await UserLoginSchema.findOne({ linkedId: AdminID });
  if (userLogin) {
    await UserLoginSchema.findByIdAndDelete(userLogin._id);
  }

  // 🗑 Delete admin record
  await Admin.findByIdAndDelete(AdminID);

  res.status(200).json({
    status: "success",
    message: "Officer and related login deleted successfully.",
    data: null,
  });
});

exports.DisplayAdmin = AsyncErrorHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const { search = "", dateFrom, dateTo } = req.query;

    const matchStage = {};

    // Date Filtering
    const hasDateFrom = dateFrom && dateFrom.trim() !== "";
    const hasDateTo = dateTo && dateTo.trim() !== "";

    if (hasDateFrom || hasDateTo) {
      matchStage.created_at = {};

      if (hasDateFrom) {
        matchStage.created_at.$gte = new Date(dateFrom);
      }

      if (hasDateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1); // include full day
        matchStage.created_at.$lt = endDate;
      }
    }

    // Aggregation Pipeline
    const pipeline = [
      {
        $addFields: {
          full_name: {
            $concat: [
              { $ifNull: ["$first_name", ""] },
              " ",
              { $ifNull: ["$middle_name", ""] },
              " ",
              { $ifNull: ["$last_name", ""] },
            ],
          },
        },
      },
      {
        $match: {
          ...matchStage,
          ...(search.trim()
            ? {
                full_name: {
                  $regex: new RegExp(search.trim(), "i"),
                },
              }
            : {}),
        },
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const results = await Admin.aggregate(pipeline);

    const data = results[0].data;
    const totalAdmin = results[0].totalCount[0]?.count || 0;

    res.status(200).json({
      status: "success",
      data,
      totalAdmin,
      currentPage: page,
      totalPages: Math.ceil(totalAdmin / limit),
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching admin data.",
      error: error.message,
    });
  }
});
exports.DisplayProfile = AsyncErrorHandler(async (req, res) => {
  const loggedInAdminId = req.user.linkId;
  const admin = await Admin.findById(loggedInAdminId);
  if (!admin) {
    return res.status(404).json({
      status: "fail",
      message: "Admin not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: admin,
  });
});
