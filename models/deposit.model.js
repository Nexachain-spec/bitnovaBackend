import mongoose from "mongoose";

const depositSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
const DepositModel = mongoose.model("DepositModel", depositSchema);
export default DepositModel;
