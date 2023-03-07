const Web3 = require('web3')
const BlockModel = require('../modules/block/blockModel')
const utils = require('../helper/utils')
const {
  encodeEventSignature,
  getTransactionReceipt,
  transfer721EventInputsWithSignarure,
  decodeLogTopics,
} = require('../helper/rpcHelper.js')

const _web3 = {
  [process.env.ETH_CHAIN_ID]: new Web3(process.env.ETH_RPC),
  [process.env.BNB_MAINNET_CHAIN_ID]: new Web3(process.env.BNB_MAINNET_RPC),
  [process.env.BNB_CHAIN_ID]: new Web3(process.env.BNB_RPC),
  [process.env.MATIC_CHAIN_ID]: new Web3(process.env.MATIC_RPC),
  [process.env.FTM_CHAIN_ID]: new Web3(process.env.FTM_RPC),
}

const cronTasks = {}

cronTasks.analyze = async (req, res, chainId) => {
  try {
    const processedBorderBlockNumber = await BlockModel.findOne({
      chainId,
    })

    const getBlockNumber = await _web3[chainId].eth.getBlockNumber()
    console.log('Last block number is ', getBlockNumber)
    // Fetch block data
    const blockData = await _web3[chainId].eth.getBlock(getBlockNumber)

    // Create Hex encoded event abi
    const transfer721EncodedTopic = await encodeEventSignature(
      _web3[chainId],
      'transfer721',
    )

    if (blockData) {
      if (blockData.transactions.length) {
        // Loop through all transactions in block data
        for (let i = 0; i < blockData.transactions.length; i++) {
          // Fetch transaction receipt data to loop through all the event logs
          const transactionData = await getTransactionReceipt(
            _web3[chainId],
            blockData.transactions[i],
          )
          if (transactionData.logs.length) {
            // Loop through all the logs inside a transaction
            for (let k = 0; k < transactionData.logs.length; k++) {
              const logs = transactionData.logs[k]

              if (logs.topics.length) {
                // Loop through all topics inside transaction logs
                for (let l = 0; l < logs.topics.length; l++) {
                  const topic = logs.topics[l]

                  // Check if topic signature is equals to needed event signature
                  if (topic == transfer721EncodedTopic) {
                    try {
                      // Decode event log
                      const decodedLog = await decodeLogTopics(
                        _web3[chainId],
                        'transfer721EventsWithSignature',
                        transactionData.logs[k].data,
                        transactionData.logs[k].topics,
                      )

                      // Logging the contract address and decoded event data
                      console.log(transactionData.logs[k].address, decodedLog)
                    } catch (error) {
                      console.log("coudn't get decoded log", error.message)
                      continue
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

module.exports = cronTasks
