const cron = require("node-cron");
const cronTasks = require("./cronTasks");

cron.schedule("*/10 * * * * *", async (req, res) => {
    cronTasks.analyze(req, res, process.env.BNB_CHAIN_ID)
});
