import mongoose from "mongoose";

const rewardsSchemaOfUser = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    contributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    message: {
      type: String,
      default: "Reward for 5 users with ₹100+ investment",
    },
  },
  { timestamps: true }
);

const UserReward = mongoose.model("UserReward", rewardsSchemaOfUser);
export default UserReward;
