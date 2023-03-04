const mongoose = require("mongoose");

const { Schema } = mongoose;

const contractModelSchema = new Schema(
    {
        contractAddress: {
            type: String,
            lowercase: true,
            required: true,
        },
        chainId: {
            type: String,
            lowercase: true,
            required: true,
        },
        standart: {
            // false - 721, true - 1155,
            type: Boolean,
            // type: String,
            // enum: ["721", "1155"],
            default: null,
        },
        name: {
            type: String,
            default: null,
        },
        birthBlock: {
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

contractModelSchema.index(
    { chainId: 1, contractAddress: 1 },
    { unique: true, },
);

module.exports = mongoose.model("contracts", contractModelSchema);