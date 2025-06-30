import mongoose from "mongoose";

const withdrawalLimitSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      unique: true,
    },
    singleWithdrawalLimit: {
      type: Number,
      required: true,
    },
    perMonthWithdrawalCount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WithdrawalLimit = mongoose.model(
  "WithdrawalLimit",
  withdrawalLimitSchema
);
export default WithdrawalLimit;
