const cron = require("node-cron");
const cronTasks = require("./cronTasks");

cron.schedule("* * * * *", async (req, res) => {
});
