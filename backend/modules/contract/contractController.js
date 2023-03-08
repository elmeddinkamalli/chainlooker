const Utils = require("../../helper/utils");
const { query } = require("winston");
const contractModel = require("./contractModel");
const ContractCtr = {};

// add new category
ContractCtr.addNewContractByTnxReceipt = async (transaction, chainId) => {
  if (transaction && !transaction.to && transaction.contractAddress) {
    const existingContract = await contractModel.findOne({
      chainId,
      address: transaction.contractAddress.toLowerCase(),
    });

    if (!existingContract) {
      await contractModel({
        chainId,
        address: transaction.contractAddress,
        birthBlock: transaction.blockNumber,
      }).save();
    }
  }
};

module.exports = ContractCtr;
