const Web3 = require('web3')
const BlockModel = require('../modules/block/blockModel')
const utils = require('../helper/utils')
const {
  encodeEventSignature,
  getTransactionReceipt,
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
    const blockData = await _web3[chainId].eth.getBlock(27838255)

    // Create Hex encoded event abi
    const transfer721EncodedTopic = await encodeEventSignature(
      _web3[chainId],
      'transfer721',
    )

    const transferSingle1155EncodedTopic = await encodeEventSignature(
      _web3[chainId],
      'transferSingle1155',
    )

    const transferBatch1155EncodedTopic = await encodeEventSignature(
      _web3[chainId],
      'transferBatch1155',
    )

    const getLogs = async (topic, transactionDataLogs) => {
      let abiName;
      switch(topic) {
        case transfer721EncodedTopic:
          abiName = 'transfer721EventsWithSignature'
          break
        case transferSingle1155EncodedTopic:
          abiName = 'transferSingle1155EventsWithSignature'
          break
        case transferBatch1155EncodedTopic:
          abiName = 'transferBatch1155EventsWithSignature'
          break
        default:
          break
      }
      // Decode event log
      if(abiName){
        try{
          const decodedLog = await decodeLogTopics(
          _web3[chainId],
          abiName,
          transactionDataLogs.data,
          transactionDataLogs.topics,
          )

          // Logging the contract address and decoded event data
          return [transactionDataLogs.address, decodedLog];
        }catch(error){
          // return ['ERROR', error.message]
        }
      }
    }

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

                  try {
                    const transactionLogs = await getLogs(topic, transactionData.logs[k])
                    if(transactionLogs){
                      if (transactionLogs[0] == 'ERROR') continue;
                      console.log(transactionLogs);
                    }
                  } catch (error) {
                    console.log("coudn't get decoded log", error.message)
                    continue
                  }

                  // // Check if topic signature is equals to needed event signature
                  // if (topic == transfer721EncodedTopic) {
                  //   try {
                  //     // Decode event log
                  //     const decodedLog = await decodeLogTopics(
                  //       _web3[chainId],
                  //       'transfer721EventsWithSignature',
                  //       transactionData.logs[k].data,
                  //       transactionData.logs[k].topics,
                  //     )

                  //     // Logging the contract address and decoded event data
                  //     console.log(transactionData.logs[k].address, decodedLog)
                  //   } catch (error) {
                  //     console.log("coudn't get decoded log", error.message)
                  //     continue
                  //   }
                  // }

                  // else if (topic == transferSingle1155EncodedTopic) {
                  //   try {
                  //     const decodedLog = await decodeLogTopics(
                  //       _web3[chainId],
                  //       'transferSingle1155EventsWithSignature',
                  //       transactionData.logs[k].data,
                  //       transactionData.logs[k].topics,
                  //     );

                  //     console.log(transactionData.logs[k].address, decodedLog);
                  //   } catch (error) {
                  //     console.log("coudn't get decoded log", error.message);
                  //     continue;
                  //   }
                  // }

                  // else if (topic == transferBatch1155EncodedTopic) {
                  //   try {
                  //     const decodedLog = await decodeLogTopics(
                  //       _web3[chainId],
                  //       'transferBatch1155EventsWithSignature',
                  //       transactionData.logs[k].data,
                  //       transactionData.logs[k].topics,
                  //     );

                  //     console.log(transactionData.logs[k].address, decodedLog);
                  //   } catch (error) {
                  //     console.log("coudn't get decoded log", error.message);
                  //     continue;
                  //   }
                  // }
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
