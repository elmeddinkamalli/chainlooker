const rpcHelper = {}

rpcHelper.transfer721EventInputs = [
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

rpcHelper.transfer721EventInputsWithSignarure = [
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

rpcHelper.transfer721EventObject = {
  anonymous: false,
  inputs: rpcHelper.transfer721EventInputs,
  name: 'Transfer',
  type: 'event',
}

rpcHelper.getEventAbiByName = (Name) => {
  switch (Name) {
    case 'transfer721':
      return rpcHelper.transfer721EventObject
      break
    case 'transfer721EventsWithSignature':
      return rpcHelper.transfer721EventInputsWithSignarure
      break

    default:
      break
  }
}

rpcHelper.encodeEventSignature = async (Provider, Event) => {
  return await Provider.eth.abi.encodeEventSignature(
    rpcHelper.getEventAbiByName(Event),
  )
}

rpcHelper.getTransactionReceipt = async (Provider, Hash) => {
  return await Provider.eth.getTransactionReceipt(Hash)
}

rpcHelper.decodeLogTopics = async (Provider, Event, DataHex, Topics) => {
  return await Provider.eth.abi.decodeLog(
    rpcHelper.getEventAbiByName(Event),
    DataHex,
    Topics,
  )
}

module.exports = rpcHelper
