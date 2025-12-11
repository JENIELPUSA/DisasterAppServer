const cron = require('node-cron');
const deleteOldNotifications = require("../deleteOldNotification");


const scheduleRetentionJob = () => {
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ Running scheduled retention archive job...');
    await deleteOldNotifications();
  });
};

module.exports = scheduleRetentionJob;
