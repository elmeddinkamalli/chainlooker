const Web3 = require('web3')
const { encodeEventSignature } = require("./helper/rpcHelper")
global.VALID_CHAINS = [
    process.env.ETH_MAINNET_CHAIN_ID,
    process.env.ETH_CHAIN_ID,
    process.env.BNB_CHAIN_ID
]

global.VALID_RPCS = {
    [process.env.ETH_MAINNET_CHAIN_ID]: new Web3(process.env.ETH_MAINNET_RPC),
    [process.env.ETH_CHAIN_ID]: new Web3(process.env.ETH_RPC),
    [process.env.BNB_MAINNET_CHAIN_ID]: new Web3(process.env.BNB_MAINNET_RPC),
    [process.env.BNB_CHAIN_ID]: new Web3(process.env.BNB_RPC),
    [process.env.MATIC_CHAIN_ID]: new Web3(process.env.MATIC_RPC),
    [process.env.FTM_CHAIN_ID]: new Web3(process.env.FTM_RPC),
};

global.VALID_EVENTS = [
    "transfer721",
    "transferSingle1155",
    "transferBatch1155"
]

global.VALID_EVENT_SIGNATURES = [];
global.VALID_EVENT_SIGNATURE_NAMES = {};

// (async function(){
//     for (let index = 0; index <= VALID_CHAINS.length; index++) {
//         global.VALID_EVENT_SIGNATURES[VALID_CHAINS[index]] = [];
//         for (let k = 0; k < VALID_EVENTS.length; k++) {
//             global.VALID_EVENT_SIGNATURES[VALID_CHAINS[index]].push(await encodeEventSignature(VALID_RPCS[VALID_CHAINS[index]], VALID_EVENTS[k]))
//         }
//     }
// })()

(async function(){
    for (let index = 0; index < VALID_EVENTS.length; index++) {
        const signature = await encodeEventSignature(VALID_RPCS[VALID_CHAINS[0]], VALID_EVENTS[index]);
        global.VALID_EVENT_SIGNATURES.push(signature)
        global.VALID_EVENT_SIGNATURE_NAMES[signature] = VALID_EVENTS[index]
    }
})()