const express = require("express");
const router = express.Router();//express router
const OrganizerController=require('../Controller/OrganizerController')
const authController = require('../Controller/authController')
const upload = require("../middleware/imageUploader");
router.route('/')
    .get(authController.protect,OrganizerController.DisplayOrganizer)
router.route('/:id')
    .delete(authController.protect,OrganizerController.deleteOrganizer)
    .patch(authController.protect,upload.single("avatar"),OrganizerController.updateOrganizer)

module.exports = router;