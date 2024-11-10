// const cron = require('node-cron');
// const {initCronJobs} = require("../features/payments/jobs/leaderboardPayment");
// const distributeLeaderboardRewards = require('../features/payments/jobs/leaderboardPayment');


// For Every hour

// const initCronJobs = () => {
//   // Run every hour
//   cron.schedule('0 * * * *', async () => {
//     console.log('Running scheduled leaderboard reward distribution');
//     await distributeLeaderboardRewards();
//   });
// };

// // For every 2 mins
// const initCronJobs = () => {
//   // Run every 2 minutes
//   cron.schedule('*/1 * * * *', async () => {
//     console.log('Running scheduled leaderboard reward distribution');
//     await distributeLeaderboardRewards();
//   });
// };

// initCronJobs();

// module.exports = initCronJobs;