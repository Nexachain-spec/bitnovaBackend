import UserModel from "../models/user.model.js";
import RoiLevel from "../models/roiLevel.model.js";
import Roi from "../models/roi.model.js";

const getTotalIncome = (user) => {
  return user.totalRoi + user.totalLevelIncome + (user.totalOtherIncomes || 0);
};

const getTwoXCap = (user) => {
  return user.totalInvestment * 2;
};

export const collectFakeTradeProfit = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const totalIncome = getTotalIncome(user);
    const twoXCap = getTwoXCap(user);
    const remaining = twoXCap - totalIncome;

    if (remaining <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "2X achieved, no more ROI" });
    }

    const levelDetails = await RoiLevel.findOne({ level: user.level });
    if (!levelDetails) {
      return res
        .status(400)
        .json({ success: false, message: "ROI level not found" });
    }

    const roiAmount =
      ((user.totalInvestment + user.totalRoi) * levelDetails.roi) / 100;

    const progress = totalIncome / twoXCap; // 0 to 1
    const failProbability = Math.min(1, progress + 0.1); // increase fail rate as user earns
    const tradeFailed = Math.random() < failProbability;

    if (tradeFailed) {
      return res.status(200).json({
        success: true,
        message: "Trade failed! No ROI earned today.",
        tradeStatus: "failed",
      });
    }

    const roi = new Roi({
      userId,
      roiAmount,
      dayCount: 0,
      investment: user.totalInvestment,
      percentage: levelDetails.roi,
    });

    await roi.save();
    user.totalRoi += roiAmount;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Trade successful. You earned ₹${roiAmount} ROI.`,
      tradeStatus: "success",
      roiAmount,
    });
  } catch (error) {
    // console.error("Error in collectFakeTradeProfit:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
