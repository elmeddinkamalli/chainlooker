const Utils = require("../../helper/utils");
const { query } = require("winston");
const transactionModel = require("./transactionModel");
const TnxCtr = {};

// add new category
TnxCtr.storeTransaction = async (transactionData, chainId) => {
  const existTnx = await transactionModel.findOne({
    chainId,
    hash: transactionData.transactionHash.toLowerCase(),
  });

  if (!existTnx) {
    return await transactionModel({
      chainId,
      hash: transactionData.transactionHash.toLowerCase(),
      data: JSON.stringify(transactionData),
    }).save();
  }
  return existTnx._id;
};

module.exports = TnxCtr;
