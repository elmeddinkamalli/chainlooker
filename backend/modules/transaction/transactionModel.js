const mongoose = require("mongoose");

const { Schema } = mongoose;

const transactionModelSchema = new Schema(
  {
    chainId: {
      type: String,
      lowercase: true,
      required: true,
    },
    hash: {
      type: String,
      lowercase: true,
      required: true,
    },
    block: {
      type: Number,
      default: 0,
    },
    data: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

transactionModelSchema.index({ chainId: 1, hash: 1 }, { unique: true });

module.exports = mongoose.model("transactions", transactionModelSchema);
