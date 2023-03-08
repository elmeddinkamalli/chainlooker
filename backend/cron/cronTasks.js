const Web3 = require('web3')
const BlockModel = require('../modules/block/blockModel')
const utils = require('../helper/utils')
const {
  encodeEventSignature,
  getTransactionReceipt,
  decodeLogTopics,
} = require('../helper/rpcHelper.js')
const { addNewContractByTnxReceipt } = require('../modules/contract/contractController')

const _web3 = {
  [process.env.ETH_CHAIN_ID]: new Web3(process.env.ETH_RPC),
  [process.env.BNB_MAINNET_CHAIN_ID]: new Web3(process.env.BNB_MAINNET_RPC),
  [process.env.BNB_CHAIN_ID]: new Web3(process.env.BNB_RPC),
  [process.env.MATIC_CHAIN_ID]: new Web3(process.env.MATIC_RPC),
  [process.env.FTM_CHAIN_ID]: new Web3(process.env.FTM_RPC),
}

const cronTasks = {}

const getLogs = async (Provider, event, topic, transactionDataLogs) => {
  let abiName;
  // Create Hex encoded event abi
  const eventEncodedTopic = await encodeEventSignature(
    Provider,
    event,
  )

  if(eventEncodedTopic == topic){
    abiName = `${event}EventsWithSignature`;
  }

  // Decode event log
  try{
    const decodedLog = await decodeLogTopics(
    Provider,
    abiName,
    transactionDataLogs.data,
    transactionDataLogs.topics,
    )

    // Logging the contract address and decoded event data
    return [transactionDataLogs.address, decodedLog];
  }catch(error){
    console.log(error);
    // return ['ERROR', error.message]
  }
}

cronTasks.analyze = async (req, res, chainId) => {
  try {
    const processedBorderBlockNumber = await BlockModel.findOne({
      chainId,
    })

    const getBlockNumber = await _web3[chainId].eth.getBlockNumber()
    
    if(processedBorderBlockNumber.transfer < getBlockNumber){
      console.log("Offset is:", getBlockNumber - processedBorderBlockNumber.transfer);

      for (let proccessingBlockNumber = processedBorderBlockNumber.transfer; proccessingBlockNumber < getBlockNumber; proccessingBlockNumber++) {

        console.log('Processing block number is:', proccessingBlockNumber)
        // Fetch block data
        const blockData = await _web3[chainId].eth.getBlock(proccessingBlockNumber)
        console.log(blockData.transactions.length);
    
        if (blockData) {
          if (blockData.transactions.length) {
            // Loop through all transactions in block data
            for (let i = 0; i < blockData.transactions.length; i++) {
              // Fetch transaction receipt data to loop through all the event logs
              const transactionData = await getTransactionReceipt(
                _web3[chainId],
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
                      const topic = logs.topics[l]
    
                      // Check if topic signature is equals to needed event signature
                      try {
                        const transactionLogs = await getLogs(topic, transactionData.logs[k])
                        if(transactionLogs){
                          console.log(transactionLogs);
                        }
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
