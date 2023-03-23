require("dotenv").config();
require("../globals.js");
require("../config/database.js");
const { getTransactionReceipt, getLogs } = require("../helper/rpcHelper.js");
const blockModel = require("../modules/block/blockModel.js");
const {
  addNewContractByTnxReceipt,
} = require("../modules/contract/contractController.js");
const { storeNft } = require("../modules/nft/nftController.js");
const {
  storeTransaction,
} = require("../modules/transaction/transactionController.js");
const arguments = process.argv;
const chainId = arguments[2];
let startBlock = Number(arguments[3]);
const offset = Number(arguments[4]);
const ethereum20161231 = 2910000;

async function boot() {
  const savedBlock = await blockModel.findOne({
    chainId,
  });

  try {
    if (startBlock == 0) {
      startBlock = savedBlock.transfer;
    }
    const getBlockNumber = await global.VALID_RPCS[
      chainId
    ].eth.getBlockNumber();

    let offsetBlock = startBlock + offset;

    if (startBlock < getBlockNumber) {
      console.log("Offset is:", offset);

      for (startBlock; startBlock < getBlockNumber; startBlock++) {
        console.log("Processing block number is:", startBlock);
        // Fetch block data
        const blockData = await global.VALID_RPCS[chainId].eth.getBlock(
          startBlock
        );
        
        if (blockData) {
          if (blockData.transactions && blockData.transactions.length) {
            console.log(blockData.transactions.length);
            // Loop through all transactions in block data
            for (let i = 0; i < blockData.transactions.length; i++) {
              // Fetch transaction receipt data to loop through all the event logs
              const transactionData = await getTransactionReceipt(
                global.VALID_RPCS[chainId],
                blockData.transactions[i]
              );

              if (transactionData && transactionData.logs && transactionData.logs.length) {
                await addNewContractByTnxReceipt(transactionData, chainId);
                // Loop through all the logs inside a transaction
                for (let k = 0; k < transactionData.logs.length; k++) {
                  const logs = transactionData.logs[k];

                  if (logs.topics && logs.topics.length) {
                    // Loop through all topics inside transaction logs
                    for (let l = 0; l < logs.topics.length; l++) {
                      // Check if topic signature is equals to needed event signature
                      try {
                        const transactionLogs = await getLogs(
                          global.VALID_RPCS[chainId],
                          logs.topics[l],
                          transactionData.logs[k]
                        );
                        if (transactionLogs) {
                          const tnxId = await storeTransaction(
                            transactionData,
                            chainId
                          );
                          await storeNft(
                            tnxId,
                            logs.address,
                            chainId,
                            transactionLogs
                          );
                          console.log(
                            "NFT and Owners added successfully 🎉 🎉 🎉"
                          );
                        }
                      } catch (error) {
                        sendSlack(
                          `Error creating NFT and Owners. Chain: ${chainId}, Hash: ${transactionData.transactionHash}`
                        );
                        // console.log("coudn't get decoded log", error.message);
                        continue;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (offsetBlock == startBlock) {
          offsetBlock = startBlock + offset;
          if (!savedBlock) {
            await new blockModel({
              transfer: startBlock,
              chainId,
            }).save();
          } else {
            savedBlock.transfer = startBlock;
            await savedBlock.save();
          }
        }
      }

      console.log("You reached the last block");
      return;
    }

    console.log("Invalid block number");
    return false;
  } catch (err) {
    savedBlock.transfer = startBlock;
    await savedBlock.save();
    console.log(err.message);
  }
  return true;
}

return boot();
