const express = require("express");
const router = express.Router();

const floodReportController = require("../Controller/floodReportController");
const authController = require("../Controller/authController");
const { upload } = require("../middleware/multer");

// Route para sa lahat ng reports
router
  router
  .route("/")
  .post(
    authController.protect, // Checkpoint 1
    (req, res, next) => {
      console.log("Passed Protect Middleware ✅");
      next();
    },
    upload.fields([
      { name: "media", maxCount: 10 }
    ]),
    (req, res, next) => {
      console.log("Passed Multer Upload ✅");
      console.log("Fields received:", req.body);
      next();
    },
    floodReportController.createIncidentReport // Checkpoint 2
  )
  .get(authController.protect, floodReportController.getAllReports);

// Route para sa specific report
router
  .route("/:id")
  .delete(authController.protect, floodReportController.deleteReport);

module.exports = router;