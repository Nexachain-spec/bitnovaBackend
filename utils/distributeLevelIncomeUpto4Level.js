import Commission from "../models/teamIncome.model.js";
import UserModel from "../models/user.model.js";

const commissionRatesByLevel = [
  { level: 1, percent: 10 },
  { level: 2, percent: 2 },
  { level: 3, percent: 2 },
  { level: 4, percent: 1 },
];

export const distributeCommissionsForAiAgent = async (user, investedAmount) => {
  try {
    const uplineChain = [];
    let current = user;

    for (let i = 0; i < 4; i++) {
      if (!current.sponsorId) break;

      const sponsor = await UserModel.findById(current.sponsorId);
      if (!sponsor) break;

      uplineChain.push(sponsor);
      current = sponsor;
    }

    for (let i = 0; i < uplineChain.length; i++) {
      const uplineUser = uplineChain[i];
      const { level, percent } = commissionRatesByLevel[i];
      if (uplineUser.isIncomeBlocked) {
        console.log(`⚠️ Skipping commission for ${uplineUser.username} (income blocked)`);
        continue;
      }


      const commissionAmount = (investedAmount * percent) / 100;
      console.log(commissionAmount, investedAmount, percent, level, uplineUser.username);

      uplineUser.currentEarnings += commissionAmount;
      uplineUser.mainWallet += commissionAmount;
      uplineUser.levelIncome += commissionAmount;
      await uplineUser.save();

      await Commission.create({
        userId: uplineUser._id,
        fromUserId: user._id,
        level,
        commissionType: `Level ${level}`,
        commissionPercentage: percent,
        commissionAmount,
        amount: investedAmount,
      });
    }
  } catch (error) {
    console.error("❌ Error in commission distribution:", error.message);
  }
};
