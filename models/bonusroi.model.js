import mongoose from "mongoose";

const aroiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  investment: {
    type: Number,
    default: 0,
  },
  compoundInvestmentAmount: {
    type: Number,
    default: 0,
  },
  roiAmount: {
    type: Number,
    required: true,
  },
  dayCount: {
    type: Number,
    required: true,
  },
  creditedOn: {
    type: Date,
    default: Date.now,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  isClaimed: {
    type: Boolean,
    default: false,
  },
});

const BonusRoi = mongoose.model("BonusRoi", aroiSchema);
export default BonusRoi;
