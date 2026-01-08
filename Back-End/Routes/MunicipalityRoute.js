const express = require("express");
const router = express.Router();

const municipalityController = require("../Controller/municipalityController");
const authController = require("./../Controller/authController");

router
  .route("/")
  .post(authController.protect, municipalityController.createMunicipality)
  .get(authController.protect, municipalityController.getMunicipalities);

router
  .route("/:id")
  .delete(authController.protect, municipalityController.deleteMunicipality)
  .patch(authController.protect, municipalityController.updateMunicipality);

module.exports = router;
