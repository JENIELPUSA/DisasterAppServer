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
router.route("/BarangayDropdown").get(BarangayController.getBarangays);

router
  .route("/displayBarangaysForUser")
  .get(authController.protect, BarangayController.displayBarangaysForUser);

router
  .route("/dropdownbarangayformaps")
  .get(authController.protect, BarangayController.dropdownbarangayformaps);

module.exports = router;
