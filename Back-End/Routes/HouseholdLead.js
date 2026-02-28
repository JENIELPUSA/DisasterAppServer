const express = require("express");
const router = express.Router();

const HouseholdLeadController = require("../Controller/householdLeadController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, HouseholdLeadController.createHouseholdLead)
  .get(authController.protect, HouseholdLeadController.getAllHouseholdLeads);
router
  .route("/getHouseholdWithMembers")
  .get(authController.protect, HouseholdLeadController.getHouseholdWithMembers);

router
  .route("/:id")
  .patch(authController.protect, HouseholdLeadController.updateHouseholdLead);
router
  .route("/DropdownAllHouseHold")
  .get(HouseholdLeadController.DropdownAllHouseHold);
router
  .route("/barangay/:barangayId")
  .get(
    authController.protect,
    HouseholdLeadController.getHouseholdLeadsByBarangayId
  );

router
  .route("/getHouseholdLeadsSendNotification")
  .get(
    authController.protect,
    HouseholdLeadController.getHouseholdLeadsSendNotification
  );

router
  .route("/getHouseholdLeadsByBarangayId/:barangayId")
  .get(
    authController.protect,
    HouseholdLeadController.getHouseholdLeadsByBarangayId
  );

module.exports = router;
