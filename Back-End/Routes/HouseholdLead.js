const express = require("express");
const router = express.Router();

const HouseholdLeadController = require("../Controller/householdLeadController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, HouseholdLeadController.createHouseholdLead)
  .get(authController.protect, HouseholdLeadController.getAllHouseholdLeads);

router
  .route("/:id")
  .patch(authController.protect, HouseholdLeadController.updateHouseholdLead);

module.exports = router;
