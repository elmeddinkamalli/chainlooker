const BlockModel = require('../modules/block/blockModel')
const utils = require('../helper/utils')
const { getTransactionReceipt, getLogs } = require('../helper/rpcHelper.js')
const {
  addNewContractByTnxReceipt,
} = require('../modules/contract/contractController')
const {
  storeTransaction,
} = require('../modules/transaction/transactionController')
const { storeNft } = require('../modules/nft/nftController')
const { sendSlack } = require('../services/slack.service')
const nftModel = require('../modules/nft/nftModel')

const cronTasks = {}

cronTasks.analyze = async (req, res, chainId) => {
  try {
    global.reenteranceGuard = true

    const processedBorderBlockNumber = await BlockModel.findOne({
      chainId,
    })

    const getBlockNumber = await global.VALID_RPCS[chainId].eth.getBlockNumber()

    if (processedBorderBlockNumber.transfer < getBlockNumber) {
      console.log(
        'Offset is:',
        getBlockNumber - processedBorderBlockNumber.transfer,
      )

      for (
        let proccessingBlockNumber = processedBorderBlockNumber.transfer;
        proccessingBlockNumber < getBlockNumber;
        proccessingBlockNumber++
      ) {
        console.log('Processing block number is:', proccessingBlockNumber)
        // Fetch block data
        const blockData = await global.VALID_RPCS[chainId].eth.getBlock(
          proccessingBlockNumber,
        )

        if (blockData) {
          if (blockData.transactions.length) {
            // Loop through all transactions in block data
            for (let i = 0; i < blockData.transactions.length; i++) {
              // Fetch transaction receipt data to loop through all the event logs
              const transactionData = await getTransactionReceipt(
                global.VALID_RPCS[chainId],
                blockData.transactions[i],
              )

              await addNewContractByTnxReceipt(transactionData, chainId)

              if (transactionData.logs.length) {
                // Loop through all the logs inside a transaction
                for (let k = 0; k < transactionData.logs.length; k++) {
                  const logs = transactionData.logs[k]

                  if (logs.topics.length) {
                    // Loop through all topics inside transaction logs
                    for (let l = 0; l < logs.topics.length; l++) {
                      // Check if topic signature is equals to needed event signature
                      try {
                        const transactionLogs = await getLogs(
                          global.VALID_RPCS[chainId],
                          logs.topics[l],
                          transactionData.logs[k],
                        )
                        if (transactionLogs) {
                          const tnxId = await storeTransaction(
                            transactionData,
                            chainId,
                          )
                          await storeNft(
                            tnxId,
                            logs.address,
                            chainId,
                            transactionLogs,
                          )
                          console.log(
                            'NFT and Owners added successfully 🎉 🎉 🎉',
                          )
                        }
                      } catch (error) {
                        sendSlack(
                          `Error creating NFT and Owners. Hash: ${transactionData.transactionHash}`,
                        )
                        // console.log("coudn't get decoded log", error, proccessingBlockNumber, transactionData);
                        continue
                      }
                      global.reenteranceGuard = false
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (!processedBorderBlockNumber) {
      await new BlockModel({
        transfer: getBlockNumber,
        chainId,
      }).save()
    } else {
      processedBorderBlockNumber.transfer = getBlockNumber
      await processedBorderBlockNumber.save()
    }
  } catch (err) {
    console.log(err.message)
    utils.echoLog(
      `error in adding new event for chain id ${chainId}: ${err.message}`,
    )
  }
}

cronTasks.sendReport = async (req, res) => {
  let message = "";
  const nftCounts = await nftModel.aggregate([
    {
      $match: {},
    },
    {
      $group: {
        _id: '$chainId',
        count: {
          $sum: 1,
        },
      },
    },
  ])

  for (let index = 0; index < nftCounts.length; index++) {
    message += `Chain ${nftCounts[index]._id}: ${nftCounts[index].count} \n`
  }

  sendSlack(message);
}

module.exports = cronTasks
