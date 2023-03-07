const Web3 = require('web3')
const BlockModel = require('../modules/block/blockModel')
const utils = require('../helper/utils')
const {
  encodeEventSignature,
  getTransactionReceipt,
  transfer721EventInputsWithSignarure,
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

const transferSingle1155EventInputs = [
  {
    indexed: true,
    internalType: 'address',
    name: 'operator',
    type: 'address',
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
    indexed: false,
    internalType: 'uint256',
    name: 'id',
    type: 'uint256',
  },
  {
    indexed: false,
    internalType: 'uint256',
    name: 'value',
    type: 'uint256',
  },
];

const transferSingle1155EventInputsWithSignature = [
  {
    indexed: true,
    internalType: 'string',
    name: 'TransferSingle',
    type: 'string',
  },
  {
    indexed: true,
    internalType: 'address',
    name: 'operator',
    type: 'address',
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
    indexed: false,
    internalType: 'uint256',
    name: 'id',
    type: 'uint256',
  },
  {
    indexed: false,
    internalType: 'uint256',
    name: 'value',
    type: 'uint256',
  },
];

const transferSingle1155EventObject = {
  anonymous: false,
  inputs: transferSingle1155EventInputs,
  name: 'TransferSingle',
  type: 'event',
};

const cronTasks = {}

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
    
        // Create Hex encoded event abi
        const transfer721EncodedTopic = await encodeEventSignature(
          _web3[chainId],
          'transfer721',
        )
    
        const transferSingle1155EncodedTopic = _web3[chainId].eth.abi.encodeEventSignature(
          transferSingle1155EventObject,
        );
    
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
    
                      else if (topic == transferSingle1155EncodedTopic) {
                        try {
                          const decodedLog = await _web3[chainId].eth.abi.decodeLog(
                            transferSingle1155EventInputsWithSignature,
                            transactionData.logs[k].data,
                            transactionData.logs[k].topics,
                          );
    
                          console.log(transactionData.logs[k].address, decodedLog);
                        } catch (error) {
                          console.log("coudn't get decoded log", error.message);
                          continue;
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
