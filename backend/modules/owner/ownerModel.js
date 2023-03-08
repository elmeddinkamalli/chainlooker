const mongoose = require("mongoose");

const { Schema } = mongoose;

const ownerModelSchema = new Schema(
  {
    address: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

module.exports = mongoose.model("owners", ownerModelSchema);
