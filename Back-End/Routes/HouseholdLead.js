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
router
  .route("/DropdownAllHouseHold")
  .get(HouseholdLeadController.DropdownAllHouseHold);
router
  .route("/barangay/:barangayId")
  .get(authController.protect,HouseholdLeadController.getHouseholdLeadsByBarangayId);

module.exports = router;
