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

const cronTasks = {}

cronTasks.analyze = async (req, res, chainId) => {
  try {
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
      }
    ]
    const transfer721EventObject = {
      anonymous: false,
      inputs: transfer721EventInputs,
      name: 'Transfer',
      type: 'event',
    }
    const blockData = await _web3[chainId].eth.getBlock(27752636)
    // console.log(blockData);
    const transfer721EncodedTopic = _web3[chainId].eth.abi.encodeEventSignature(
      transfer721EventObject,
    )
    // console.log(blockData)

    if (blockData) {
      if (blockData.transactions.length) {
        for (let i = 0; i < blockData.transactions.length; i++) {
        //   console.log('i is', i)
          const transactionData = await _web3[
            chainId
          ].eth.getTransactionReceipt(blockData.transactions[i])
          //   console.log(transactionData);

          if (transactionData.logs.length) {
            for (let k = 0; k < transactionData.logs.length; k++) {
            // console.log('k is', k)

              const logs = transactionData.logs[k]

              if (logs.topics.length) {
                for (let l = 0; l < logs.topics.length; l++) {
        //   console.log('ll is', l)

                  const topic = logs.topics[l]
                  if (topic == transfer721EncodedTopic) {
                    // console.log(transactionData.logs[k])
                    // console.log( transfer721EventInputs,
                    //     transactionData.logs[k].data,
                    //     transactionData.logs[k].topics);
                    try {
                      const decodedLog = await _web3[chainId].eth.abi.decodeLog(
                        transfer721EventInputs,
                        transactionData.logs[k].data,
                        transactionData.logs[k].topics,
                      );
                      console.log(decodedLog)
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

    // await _web3[chainId].getPastEvents("allEvents", {fromBlock: blockNumber, toBlock: blockNumber})

    console.log('blockData')
  } catch (err) {
    console.log(err.message)
    utils.echoLog(
      `error in adding new event for chain id ${chainId}: ${err.message}`,
    )
  }
}

module.exports = cronTasks
