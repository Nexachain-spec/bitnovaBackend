import mongoose from "mongoose";

const teamCommisionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    default: 0
  },
  commissionPercentage: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Commission = mongoose.model("Commission", teamCommisionSchema);

export default Commission;
