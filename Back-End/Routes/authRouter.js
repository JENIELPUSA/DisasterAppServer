const express = require('express');
const authController = require('../Controller/authController');
const { upload } = require("../middleware/multer"); // Destructured import
const router = express.Router();

router.post('/signup', upload.single("avatar"), authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected routes
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);

module.exports = router;