const nftOwnerModel = require("../nftOwner/nftOwnerModel");
const ownerModel = require("./ownerModel");

const OwnerCtr = {};

// add new category
OwnerCtr.ownNft = async (eventSimplified, nftId) => {
  let senderId, receiverId;
  const sender = await ownerModel.findOne({
    address: eventSimplified["from"].toLowerCase(),
  });
  const receiver = await ownerModel.findOne({
    address: eventSimplified["to"].toLowerCase(),
  });

  if (!sender) {
    senderId = await ownerModel({
      address: eventSimplified["from"].toLowerCase(),
    }).save();
  } else {
    senderId = sender._id;
  }

  if (!receiver) {
    receiverId = await ownerModel({
      address: eventSimplified["to"].toLowerCase(),
    }).save();
  } else {
    receiverId = receiver._id;
  }

  const existSender = await nftOwnerModel.findOne({
    ownerId: senderId,
    nftId,
  });

  if (existSender) {
    existSender.amount = existSender.amount - eventSimplified["amount"];
    await existSender.save();
  } else {
    await nftOwnerModel({
      ownerId: senderId,
      nftId,
      amount: eventSimplified["amount"],
    }).save();
  }

  const existReceiver = await nftOwnerModel.findOne({
    ownerId: receiverId,
    nftId,
  });

  if (existReceiver) {
    existReceiver.amount = existReceiver.amount + eventSimplified["amount"];
    await existReceiver.save();
  } else {
    await nftOwnerModel({
      ownerId: receiverId,
      nftId,
      amount: eventSimplified["amount"],
    }).save();
  }

  return true;
};

module.exports = OwnerCtr;
