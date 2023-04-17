const Utils = require("../../helper/utils");
const { query } = require("winston");
const nftModel = require("./nftModel");
const { ownNft } = require("../owner/ownerController");
const NftCtr = {};

// add new category
NftCtr.storeNft = async (transactionId, contractAddress, chainId, eventLog) => {
  let eventSimplified = [];
  if ("tokenId" in eventLog) {
    eventSimplified[0] = {
      tokenId: eventLog["tokenId"],
      from: eventLog["from"],
      to: eventLog["to"],
      amount: 1,
      type: 721,
    };
  } else if ("id" in eventLog) {
    if (Array.isArray(eventLog["id"])) {
      for (let i = 0; i < eventLog["id"].length; i++) {
        eventSimplified[i] = {
          tokenId: eventLog["id"][i],
          from: eventLog["from"][i],
          to: eventLog["to"][i],
          amount: Number(eventLog["value"][i]),
          type: 1155,
        };
      }
    } else {
      eventSimplified[0] = {
        tokenId: eventLog["id"],
        from: eventLog["from"],
        to: eventLog["to"],
        amount: Number(eventLog["value"]),
        type: 1155,
      };
    }
  } else {
    console.log("ChainlookerLog: Invalid event");
    return eventSimplified;
  }

  for (let i = 0; i < eventSimplified.length; i++) {
    let nftId;
    const existNft = await nftModel.findOne({
      chainId,
      contractAddress,
      tokenId: eventSimplified[i]["tokenId"],
    });

    if (existNft) {
      nftId = existNft._id;
    } else {
      const minter =
        eventSimplified[i]["from"] == global.ZERO_ADDRESS
          ? eventSimplified[i]["to"]
          : null;
      nftId = await nftModel({
        chainId,
        contractAddress,
        tokenId: eventSimplified[i]["tokenId"],
        transactionId,
        minterAddress: minter,
        totalAmount: minter ? Number(eventSimplified[i]["amount"]) : 0,
      }).save();
      console.log("ChainlookerLog: New NFT created 🎉 🎉 🎉");
    }

    await ownNft(eventSimplified[i], nftId);
  }
};

module.exports = NftCtr;
