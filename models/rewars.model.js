import mongoose from "mongoose";
import UserModel from "./user.model.js";
const rewardSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: UserModel
    },
    amount: {
        type: Number,
        default: 0
    },
    rewardType: {
        type: String,
        default: "Reward given by Admin"
    }

}, { timestamps: true })
const UserRewards = mongoose.model("rewardSchema", UserRewards)
export default UserRewards