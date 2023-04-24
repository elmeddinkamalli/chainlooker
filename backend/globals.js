const Web3 = require("web3");
const { encodeEventSignature } = require("./helper/rpcHelper");
global.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
global.VALID_CHAINS = [
  process.env.ETH_MAINNET_CHAIN_ID,
  process.env.OPTIMISM_MAINNET_CHAIN_ID,
  process.env.ETH_CHAIN_ID,
  process.env.BNB_CHAIN_ID,
  process.env.BNB_MAINNET_CHAIN_ID,
  process.env.POLYGON_CHAIN_ID,
  process.env.AVAX_CHAIN_ID,
  process.env.FTM_MAINNET_CHAIN_ID,
];

global.VALID_RPCS = {
  [process.env.ETH_MAINNET_CHAIN_ID]: new Web3(process.env.ETH_MAINNET_RPC),
  [process.env.OPTIMISM_MAINNET_CHAIN_ID]: new Web3(process.env.OPTIMISM_MAINNET_RPC),
  [process.env.ETH_CHAIN_ID]: new Web3(process.env.ETH_RPC),
  [process.env.BNB_MAINNET_CHAIN_ID]: new Web3(process.env.BNB_MAINNET_RPC),
  [process.env.BNB_CHAIN_ID]: new Web3(process.env.BNB_RPC),
  [process.env.POLYGON_CHAIN_ID]: new Web3(process.env.POLYGON_RPC),
  [process.env.AVAX_CHAIN_ID]: new Web3(process.env.AVAX_RPC),
  [process.env.FTM_MAINNET_CHAIN_ID]: new Web3(process.env.FTM_MAINNET_RPC),
};

global.CHAIN_NAMES = {
  [process.env.ETH_MAINNET_CHAIN_ID]: "ETH Mainnet",
  [process.env.OPTIMISM_MAINNET_CHAIN_ID]: "Optimism Mainnet",
  [process.env.ETH_CHAIN_ID]: "Goerli",
  [process.env.BNB_MAINNET_CHAIN_ID]: "BNB Mainnet",
  [process.env.BNB_CHAIN_ID]: "BNB Testnet",
  [process.env.POLYGON_CHAIN_ID]: "Polygon Mainnet",
  [process.env.AVAX_CHAIN_ID]: "Avalanche Mainnet",
  [process.env.FTM_MAINNET_CHAIN_ID]: "Fantom Mainnet",
};

global.VALID_EVENTS = [
  "transfer721",
  "transferSingle1155",
  "transferBatch1155",
];

global.VALID_EVENT_SIGNATURES = [];
global.VALID_EVENT_SIGNATURE_NAMES = {};

(async function () {
  for (let index = 0; index < VALID_EVENTS.length; index++) {
    const signature = await encodeEventSignature(
      VALID_RPCS[VALID_CHAINS[0]],
      VALID_EVENTS[index]
    );
    global.VALID_EVENT_SIGNATURES.push(signature);
    global.VALID_EVENT_SIGNATURE_NAMES[signature] = VALID_EVENTS[index];
  }
})();
