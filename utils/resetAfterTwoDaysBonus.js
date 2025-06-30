import UserModel from "../models/user.model.js";

export const resetBonusAfter2Days = async () => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const result = await UserModel.updateMany(
      {
        bonusAddedAt: { $lte: twoDaysAgo },
        BonusCredit: { $gt: 0 },
      },
      {
        $set: { BonusCredit: 0 },
      }
    );

    // console.log(`✅ Bonus reset for ${result.modifiedCount} user(s).`);
  } catch (error) {
    // console.error("❌ Error resetting bonus:", error.message);
  }
};
