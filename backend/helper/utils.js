const { winston } = global;
const Web3 = require("web3");
const fs = require("fs");
const utils = {};

utils.echoLog = (...args) => {
  if (process.env.SHOW_LOG === "true") {
    try {
      winston.info(args);
    } catch (e) {
      winston.log(e);
    }
  }
  // }
};

module.exports = utils;
