require('dotenv').config()
require('../config/database.js')
const Web3 = require('web3');
const { encodeEventSignature, getTransactionReceipt, decodeLogTopics } = require('../helper/rpcHelper.js');
const blockModel = require('../modules/block/blockModel.js');
const { addNewContractByTnxReceipt } = require('../modules/contract/contractController.js');
const arguments = process.argv;
const chainId = arguments[2];
let startBlock = Number(arguments[3]);
const offset = Number(arguments[4]);
const ethereum20161231 = 2910000;

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

const _web3 = {
  [process.env.BNB_CHAIN_ID]: new Web3(
    new Web3.providers.HttpProvider(process.env.BNB_RPC),
  ),
  [process.env.ETH_CHAIN_ID]: new Web3(
    new Web3.providers.HttpProvider(process.env.ETH_RPC),
  ),
  [process.env.MATIC_CHAIN_ID]: new Web3(
    new Web3.providers.HttpProvider(process.env.MATIC_RPC),
  ),
  1: new Web3(
    new Web3.providers.HttpProvider(
      'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    ),
  ),
}

async function boot() {
  try {
    const getBlockNumber = await _web3[chainId].eth.getBlockNumber()
    const savedBlock = await blockModel.findOne({
        chainId
    })
    let offsetBlock = startBlock+offset;

    if (startBlock < getBlockNumber) {
      console.log(
        'Offset is:',
        offset,
      )

      for (
        startBlock;
        startBlock < getBlockNumber;
        startBlock++
      ) {
        console.log('Processing block number is:', startBlock)
        // Fetch block data
        const blockData = await _web3[chainId].eth.getBlock(
          startBlock,
        )
        console.log(blockData.transactions.length)

        // Create Hex encoded event abi
        const transfer721EncodedTopic = await encodeEventSignature(
          _web3[chainId],
          'transfer721',
        )

        const transferSingle1155EncodedTopic = _web3[
          chainId
        ].eth.abi.encodeEventSignature(transferSingle1155EventObject)

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
                          console.log(
                            transactionData.logs[k].address,
                            decodedLog,
                          )
                        } catch (error) {
                          console.log("coudn't get decoded log", error.message)
                          continue
                        }
                      } else if (topic == transferSingle1155EncodedTopic) {
                        try {
                          const decodedLog = await _web3[
                            chainId
                          ].eth.abi.decodeLog(
                            transferSingle1155EventInputsWithSignature,
                            transactionData.logs[k].data,
                            transactionData.logs[k].topics,
                          )

                          console.log(
                            transactionData.logs[k].address,
                            decodedLog,
                          )
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

        if(offsetBlock == startBlock){
            offsetBlock = startBlock+offset;
            if (!savedBlock) {
                await new blockModel({
                  transfer: startBlock,
                  chainId,
                }).save()
              } else {
                savedBlock.transfer = startBlock
                await savedBlock.save()
              }
        }
      }

      console.log("You reached the last block");
      return;
    }

    console.log("Invalid block number");
    return false;
  } catch (err) {
    console.log(err.message)
    utils.echoLog(
      `error in adding new event for chain id ${chainId}: ${err.message}`,
    )
  }
  return true
}

return boot()
