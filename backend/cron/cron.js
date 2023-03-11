const cron = require("node-cron");
const cronTasks = require("./cronTasks");
global.reenteranceGuard = false;

// cron.schedule("*/10 * * * * *", async (req, res) => {
//   if (!reenteranceGuard) {
//     reenteranceGuard = true;
//     cronTasks.analyze(req, res, process.env.BNB_CHAIN_ID);
//   }
// });
cron.schedule("0 * * * *", async (req, res) => {
    cronTasks.sendReport(req, res);
});
