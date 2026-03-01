const express = require("express");
const router = express.Router();

const nasirangBahayController = require("../Controller/nasirangBahayReportController");
const authController = require("../Controller/authController");
const { upload } = require("../middleware/multer");

// Route para sa lahat ng reports
router
  .route("/")
  .post(
    authController.protect,
    // DAPAT GANITO: Para mabasa ang beforeMedia at afterMedia
    upload.fields([
      { name: "beforeMedia", maxCount: 10 },
      { name: "afterMedia", maxCount: 10 },
    ]),
    nasirangBahayController.createReport
  )
  .get(authController.protect, nasirangBahayController.getReports);

router
  .route("/getSpecificUserUploads")
  .get(authController.protect, nasirangBahayController.getSpecificUploads);

router
  .route("/getTyphoneName")
  .get(authController.protect, nasirangBahayController.getyphoonName);

// Route para sa specific report
router
  .route("/DisplayAllNasirangBahay")
  .get(authController.protect, nasirangBahayController.DisplayAllNasirangBahay);

router
  .route("/SendAfterReport/:id")
  .patch(
    authController.protect,
    upload.fields([{ name: "afterMedia", maxCount: 10 }]),
    nasirangBahayController.SendAfterReport
  );

router
  .route("/:id")
  .get(authController.protect, nasirangBahayController.getReportById)
  .patch(
    authController.protect,
    upload.fields([
      { name: "beforeMedia", maxCount: 10 },
      { name: "afterMedia", maxCount: 10 },
    ]),
    nasirangBahayController.updateReport
  )
  .delete(authController.protect, nasirangBahayController.deleteReport);

module.exports = router;
