const express = require("express");
const router = express.Router();

const HouseholdMemberController = require("../Controller/HouseholdMemberController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, HouseholdMemberController.createHouseholdMember)
  .get(authController.protect, HouseholdMemberController.getHouseholdMembers);

router
  .patch(
    "/:id/status",
    authController.protect,
    HouseholdMemberController.updateHouseholdMemberStatus
  )
  .patch(
    "/:id",
    authController.protect,
    HouseholdMemberController.updateHouseholdMember
  );

module.exports = router;
