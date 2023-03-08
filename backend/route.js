const express = require("express");
const app = express.Router();

// Routes
app.all("/*", (req, res) => {});

module.exports = app;
