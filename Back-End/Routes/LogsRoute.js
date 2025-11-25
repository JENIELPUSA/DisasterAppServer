const express = require('express');
const LogsController = require('./../Controller/LogsController');
const authController = require('./../Controller/authController');
const router = express.Router();

router
  .route('/')
  .get(authController.protect, LogsController.displayAuditLogs);

module.exports = router;
