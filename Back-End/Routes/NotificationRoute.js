const express = require('express');
const router = express.Router();

const NotificationController = require('./../Controller/NotificationController');
const authController = require('./../Controller/authController');

router
  .route('/')
  .post(authController.protect, NotificationController.createNotification)
  .get(authController.protect, NotificationController.getNotifications);

router
  .route('/:id')
  .delete(authController.protect, NotificationController.deleteNotification);

module.exports = router;
