const Web3 = require('web3')
const BlockModel = require('../modules/block/blockModel')
const utils = require('../helper/utils')

const _web3 = {
  [process.env.ETH_CHAIN_ID]: new Web3(process.env.ETH_RPC),
  [process.env.BNB_MAINNET_CHAIN_ID]: new Web3(process.env.BNB_MAINNET_RPC),
  [process.env.BNB_CHAIN_ID]: new Web3(process.env.BNB_RPC),
  [process.env.MATIC_CHAIN_ID]: new Web3(process.env.MATIC_RPC),
  [process.env.FTM_CHAIN_ID]: new Web3(process.env.FTM_RPC),
}

const transfer721EventInputs = [
  {
    indexed: true,
    internalType: 'address',
    name: 'from',
    type: 'address',
  },
  {
    indexed: true,
    internalType: 'address',
    name: 'to',
    type: 'address',
  },
  {
    indexed: true,
    internalType: 'uint256',
    name: 'tokenId',
    type: 'uint256',
  },
]
const transfer721EventInputsWithSignarure = [
  {
    indexed: true,
    internalType: 'string',
    name: 'Transfer',
    type: 'string',
  },
  {
    indexed: true,
    internalType: 'address',
    name: 'from',
    type: 'address',
  },
  {
    indexed: true,
    internalType: 'address',
    name: 'to',
    type: 'address',
  },
  {
    indexed: true,
    internalType: 'uint256',
    name: 'tokenId',
    type: 'uint256',
  },
]
const transfer721EventObject = {
  anonymous: false,
  inputs: transfer721EventInputs,
  name: 'Transfer',
  type: 'event',
}

const cronTasks = {}

cronTasks.analyze = async (req, res, chainId) => {
  try {
    // Fetch block data
    const blockData = await _web3[chainId].eth.getBlock(27772218)

    // Create Hex encoded event abi
    const transfer721EncodedTopic = _web3[chainId].eth.abi.encodeEventSignature(
      transfer721EventObject,
    )

    if (blockData) {
      if (blockData.transactions.length) {
        // Loop through all transactions in block data
        for (let i = 0; i < blockData.transactions.length; i++) {
          // Fetch transaction receipt data to loop through all the event logs
          const transactionData = await _web3[
            chainId
          ].eth.getTransactionReceipt(blockData.transactions[i])
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
                      const decodedLog = await _web3[chainId].eth.abi.decodeLog(
                        transfer721EventInputsWithSignarure,
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
  } catch (err) {
    console.log(err.message)
    utils.echoLog(
      `error in adding new event for chain id ${chainId}: ${err.message}`,
    )
  }
}

module.exports = cronTasks
