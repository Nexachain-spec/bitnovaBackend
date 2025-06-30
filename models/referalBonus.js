import mongoose from "mongoose";

const referalBonusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
  },
  amount: {
    type: Number,
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Investment",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ReferalBonus = new mongoose.model("ReferalBonus", referalBonusSchema);

export default ReferalBonus;
