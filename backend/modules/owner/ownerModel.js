const mongoose = require("mongoose");

const { Schema } = mongoose;

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
    },
    {
        timestamps: true,
        toJSON: {
          getters: true,
        },
    }
);

ownerModelSchema.index(
    { chainId: 1, address: 1, },
    { unique: true, },
);

module.exports = mongoose.model("owners", ownerModelSchema);