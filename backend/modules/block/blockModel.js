const mongoose = require("mongoose");

const { Schema } = mongoose;

const blockModelSchema = new Schema(
  {
    chainId: {
      type: String,
      lowercase: true,
      required: true,
    },
    transfer: {
      type: Number,
      defauld: 0,
    },
    approve: {
      type: Number,
      default: 0,
    },
    mint: {
      type: Number,
      default: 0,
    },
    burn: {
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

blockModelSchema.index({ chainId: 1 }, { unique: true });

module.exports = mongoose.model("blocks", blockModelSchema);
