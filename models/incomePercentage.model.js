import mongoose from "mongoose";

const incomePercentageSchema = new mongoose.Schema(
  {
    directReferralPercentage: {
      type: Number,
      default: 5,
    },

    Bonus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const DirectreferalPercentage = mongoose.model(
  "DirectreferalPercentage",
  incomePercentageSchema
);

export default DirectreferalPercentage;
