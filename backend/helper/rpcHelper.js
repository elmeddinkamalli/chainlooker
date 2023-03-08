const rpcHelper = {};

rpcHelper.transfer721EventInputs = [
  {
    indexed: true,
    internalType: "address",
    name: "from",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "to",
    type: "address",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "tokenId",
    type: "uint256",
  },
];

rpcHelper.transfer721EventInputsWithSignarure = [
  {
    indexed: true,
    internalType: "string",
    name: "Transfer",
    type: "string",
  },
  {
    indexed: true,
    internalType: "address",
    name: "from",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "to",
    type: "address",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "tokenId",
    type: "uint256",
  },
];

rpcHelper.transfer721EventObject = {
  anonymous: false,
  inputs: rpcHelper.transfer721EventInputs,
  name: "Transfer",
  type: "event",
};

rpcHelper.transferSingle1155EventInputs = [
  {
    indexed: true,
    internalType: "address",
    name: "operator",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "from",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "to",
    type: "address",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "id",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "value",
    type: "uint256",
  },
];

rpcHelper.transferSingle1155EventInputsWithSignature = [
  {
    indexed: true,
    internalType: "string",
    name: "TransferSingle",
    type: "string",
  },
  {
    indexed: true,
    internalType: "address",
    name: "operator",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "from",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "to",
    type: "address",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "id",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "value",
    type: "uint256",
  },
];

rpcHelper.transferSingle1155EventObject = {
  anonymous: false,
  inputs: rpcHelper.transferSingle1155EventInputs,
  name: "TransferSingle",
  type: "event",
};

rpcHelper.transferBatch1155EventInputs = [
  {
    indexed: true,
    internalType: "address",
    name: "operator",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "from",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "to",
    type: "address",
  },
  {
    indexed: false,
    internalType: "uint256[]",
    name: "ids",
    type: "uint256[]",
  },
  {
    indexed: false,
    internalType: "uint256[]",
    name: "values",
    type: "uint256[]",
  },
];

rpcHelper.transferBatch1155EventInputsWithSignature = [
  {
    indexed: true,
    internalType: "string",
    name: "TransferBatch",
    type: "string",
  },
  {
    indexed: true,
    internalType: "address",
    name: "operator",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "from",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "to",
    type: "address",
  },
  {
    indexed: false,
    internalType: "uint256[]",
    name: "ids",
    type: "uint256[]",
  },
  {
    indexed: false,
    internalType: "uint256[]",
    name: "values",
    type: "uint256[]",
  },
];

rpcHelper.transferBatch1155EventObject = {
  anonymous: false,
  inputs: rpcHelper.transferBatch1155EventInputs,
  name: "TransferBatch",
  type: "event",
};

rpcHelper.getEventAbiByName = (Name) => {
  switch (Name) {
    case "transfer721":
      return rpcHelper.transfer721EventObject;
      break;
    case "transfer721EventsWithSignature":
      return rpcHelper.transfer721EventInputsWithSignarure;
      break;
    case "transferSingle1155":
      return rpcHelper.transferSingle1155EventObject;
      break;
    case "transferSingle1155EventsWithSignature":
      return rpcHelper.transferSingle1155EventInputsWithSignature;
      break;
    case "transferBatch1155":
      return rpcHelper.transferBatch1155EventObject;
      break;
    case "transferBatch1155EventsWithSignature":
      return rpcHelper.transferBatch1155EventInputsWithSignature;
      break;
    default:
      break;
  }
};

rpcHelper.encodeEventSignature = async (Provider, Event) => {
  return await Provider.eth.abi.encodeEventSignature(
    rpcHelper.getEventAbiByName(Event)
  );
};

rpcHelper.getTransactionReceipt = async (Provider, Hash) => {
  return await Provider.eth.getTransactionReceipt(Hash);
};

rpcHelper.decodeLogTopics = async (Provider, Event, DataHex, Topics) => {
  return await Provider.eth.abi.decodeLog(
    rpcHelper.getEventAbiByName(Event),
    DataHex,
    Topics
  );
};

rpcHelper.getLogs = async (Provider, topic, transactionDataLogs) => {
  try {
    if (global.VALID_EVENT_SIGNATURES.includes(topic)) {
      const decodedLog = await rpcHelper.decodeLogTopics(
        Provider,
        `${global.VALID_EVENT_SIGNATURE_NAMES[topic]}EventsWithSignature`,
        transactionDataLogs.data,
        transactionDataLogs.topics
      );

      return decodedLog;
    }
  } catch (error) {}

  return;
};

module.exports = rpcHelper;
