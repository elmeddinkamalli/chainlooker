const mongoose = require("mongoose");

const { Schema } = mongoose;

const nftoOnerModelSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "owners",
    },
    nftId: {
      type: Schema.Types.ObjectId,
      ref: "nfts",
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

nftoOnerModelSchema.index({ ownerId: 1, nftId: 1 }, { unique: true });

module.exports = mongoose.model("nftOwners", nftoOnerModelSchema);
