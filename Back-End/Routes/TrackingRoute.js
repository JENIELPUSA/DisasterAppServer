const express = require("express");
const router = express.Router();

const TrackingController = require("../Controller/TrackingController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, TrackingController.createTracking)

router
  .route("/:id")
  .delete(authController.protect, TrackingController.deleteTracking)
module.exports = router;
