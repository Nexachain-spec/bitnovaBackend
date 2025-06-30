import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import UserReward from "../models/reward.model.js";

import UserModel from "../models/user.model.js";
import UserReward from "../models/userReward.model.js";

export const distributeIncomeForFiveUser = async (req, res) => {
  try {
    const allUsers = await UserModel.find({}).populate("referedUsers");

    if (!allUsers || allUsers.length === 0) {
      return res.status(200).json({
        message: "No users found",
        success: false,
      });
    }

    for (let user of allUsers) {
      const eligibleReferredUsers = user.referedUsers.filter(
        (refUser) => refUser.totalInvestment >= 100
      );

      if (eligibleReferredUsers.length === 5) {
        let totalInvestmentFrom5 = 0;

        for (let refUser of eligibleReferredUsers) {
          totalInvestmentFrom5 += refUser.totalInvestment;
        }

        const rewardPercentage = 10;
        const rewardAmount = (totalInvestmentFrom5 * rewardPercentage) / 100;

        user.currentEarnings += rewardAmount;

        await UserReward.create({
          userId: user._id,
          amount: rewardAmount,
          contributors: eligibleReferredUsers.map((u) => u._id),
          message: "Reward for 5 active referrals with ₹100+ investment",
        });

        await user.save();
        // console.log(
        //   `🎉 Rewarded ₹${rewardAmount} to ${user.name} for 5 active users.`
        // );
      }
    }

    return res.status(200).json({
      message:
        "✅ Reward distribution complete for users with 5 eligible referrals.",
      success: true,
    });
  } catch (error) {
    // console.error("🚨 Error in reward distribution:", error);
    return res.status(500).json({
      message: "Error in Distributing Rewards for 5 users",
      success: false,
    });
  }
};
