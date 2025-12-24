const express = require("express");
const router = express.Router();

const BarangayController = require("../Controller/BarangayController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, BarangayController.createBarangay)
  .get(authController.protect, BarangayController.displayBarangays);

router
  .route("/:id")
  .delete(authController.protect, BarangayController.deleteBarangay)
  .patch(authController.protect, BarangayController.updateBarangay);
router
  .route("/BarangayDropdown")
<<<<<<< HEAD
  .get(BarangayController.getBarangays);
=======
  .get(authController.protect, BarangayController.getBarangays)

>>>>>>> 1e3b5299950291344b3d676bc472fcfe7b028a57

module.exports = router;
