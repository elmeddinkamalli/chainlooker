const mongoose = require("mongoose");

const { Schema } = mongoose;

const nftModelSchema = new Schema(
    {
        contractAddress: {
            type: String,
            lowercase: true,
            required: true,
        },
        tokenId: {
            type: String,
            lowercase: true,
            required: true,
            sparse: true,
        },
        chainID: {
            type: String,
            lowercase: true,
            required: true,
        },
        title: {
            type: String,
            default: null,
        },
        metadataUri: {
            type: String,
            default: null,
            get: decryptProperty,
        },
        totalAmount: {
            type: Number,
            default: 0,
        },
        minterAddress: {
            type: String,
            lowercase: true,
            default: null,
        },
        mintBlock: {
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

nftModelSchema.index(
    { chainId: 1, contractAddress: 1, tokenId: 1 },
    { unique: true, },
);

module.exports = mongoose.model("nfts", nftModelSchema);