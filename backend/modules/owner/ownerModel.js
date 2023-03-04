const mongoose = require("mongoose");

const { Schema } = mongoose;

// If we want store all owned nft in one owner object:

// const nftsSchema = new Schema(
//     {
//         nftId: {
//             type: Schema.Types.ObjectId,
//             ref: "nfts",
//             required: true,
//         },
//         amount: {
//             type: Number,
//             default: 0,
//         },
//     }
// );

const ownerModelSchema = new Schema(
    {
        address: {
            type: String,
            lowercase: true,
            required: true,
        },
        chainId: {
            type: String,
            lowercase: true,
            required: true,
        },
        nftId: {
            type: Schema.Types.ObjectId,
            ref: "nfts",
            required: true,
        },
        amount: {
            type: Number,
            default: 0,
        },
        // nfts: [nftsSchema],
    },
    {
        timestamps: true,
        toJSON: {
          getters: true,
        },
    }
);

ownerModelSchema.index(
    { chainId: 1, address: 1, nftId: 1 },
    { unique: true, },
);

module.exports = mongoose.model("owners", ownerModelSchema);