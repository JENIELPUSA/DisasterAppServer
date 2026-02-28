const express = require("express");
const router = express.Router();

const EvacuationController = require("../Controller/EvacuationController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, EvacuationController.createEvacuation)
  .get(authController.protect, EvacuationController.DisplayEvacuation);
router
  .route("/DisplayAllEvacuationInMunicipality")
  .get(
    authController.protect,
    EvacuationController.DisplayAllEvacuationInMunicipality,
  );

router
  .route("/:id")
  .delete(authController.protect, EvacuationController.deleteEvacuation)
  .patch(authController.protect, EvacuationController.updateEvacuation);
router
  .route("/DisplayNearbyEvacuations")
  .post(authController.protect, EvacuationController.DisplayNearbyEvacuations);

router
  .route("/:barangayId")
  .get(
    authController.protect,
    EvacuationController.DisplayEvacuationInBarangay,
  );

module.exports = router;
