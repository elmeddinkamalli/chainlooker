const transactionModel = require("./transactionModel");
const TnxCtr = {};

// add new category
TnxCtr.storeTransaction = async (transactionData, topics, logs, chainId) => {
  const existTnx = await transactionModel.findOne({
    chainId,
    hash: transactionData.transactionHash.toLowerCase()
  });

  if (!existTnx) {
    return await transactionModel({
      chainId,
      hash: transactionData.transactionHash.toLowerCase(),
      block: transactionData.blockNumber,
      topics,
      logs: JSON.stringify(logs)
    }).save();
  }
  return existTnx._id;
};

module.exports = TnxCtr;
