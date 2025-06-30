import mongoose from "mongoose";
import UserModel from "./user.model.js";

const adminRewardSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    message: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const AdminReward = mongoose.model("AdminReward", adminRewardSchema);

export default AdminReward;
