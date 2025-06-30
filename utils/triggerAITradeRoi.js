// import UserModel from "../models/user.model.js";
// import Investment from "../models/investment.model.js";
// import RoiLevel from "../models/roiLevel.model.js";
// import Roi from "../models/roi.model.js";
// import { distributeCommissions } from "./distributeLevelIncomeUpto6LevelBasedOnRoiORAnyIncome.js";


// export const triggerAITradeRoi = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const user = await UserModel.findById(userId);

//     if (!user)
//       return res.status(404).json({ success: false, message: "User not found" });

//     const investments = await Investment.find({ userId });

//     if (investments.length === 0)
//       return res.status(400).json({ success: false, message: "No investment found" });

//     // const totalInvestmentFromInvestments = investments.reduce((sum, i) => sum + i.investmentAmount, 0);

//     // User's main wallet amount use karenge for ROI calculation
//     const mainWalletAmount = user.mainWallet || 0;

//     const totalIncome = user.currentEarnings;

//     const maxReturn = mainWalletAmount * 2;

//     const roiLevel = await RoiLevel.findOne({ level: user.level });

//     if (!roiLevel) {
//       return res.status(400).json({
//         success: false,
//         message: "ROI level not found for user level",
//       });
//     }

//     const roiPercent = roiLevel.roi;

//     const roiAmount = (mainWalletAmount * roiPercent) / 100;

//     const earningRatio = totalIncome / maxReturn;

//     // ---------- DAILY TRADE CHECK ----------
//     const level = user.level;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const lastTradeDate = user.lastTradeDate
//       ? new Date(user.lastTradeDate).setHours(0, 0, 0, 0)
//       : null;

//     if (!lastTradeDate || lastTradeDate !== today.getTime()) {
//       user.todayTradeCount = 0;
//       user.totalTradeCount = (user.totalTradeCount || 0) + 1;
//       user.lastTradeDate = new Date();
//     }

//     let maxTradesAllowed = 0;
//     if (level === 1 || level === 2) {
//       maxTradesAllowed = 1;
//     } else if (level === 3 || level === 4) {
//       maxTradesAllowed = 2;
//     } else if (level === 5 || level === 6) {
//       maxTradesAllowed = 3;
//     }

//     if (user.todayTradeCount >= maxTradesAllowed) {
//       return res.status(200).json({
//         success: false,
//         message: `You have reached the max ${maxTradesAllowed} trades for today.`,
//         tradeStatus: "limit-reached",
//       });
//     }

//     // ---------- ROI FAIL LOGIC ----------
//     let failTrade = false;

//     if ((user.totalSuccessfulTrades || 0) < 3) {
//     } else {
//       if (totalIncome + roiAmount > maxReturn) {
//         failTrade = true;
//       } else {
//         let failChance;
//         if (earningRatio < 0.3) {
//           failChance = 0.6;
//         } else if (earningRatio < 0.6) {
//           failChance = 0.3;
//         } else if (earningRatio < 0.9) {
//           failChance = 0.1;
//         } else {
//           failChance = 0.6;
//         }
//         failTrade = Math.random() < failChance;
//       }
//     }

//     if (failTrade) {
//       user.totalFailedTrades = (user.totalFailedTrades || 0) + 1;
//       user.todayTradeCount = (user.todayTradeCount || 0) + 1;
//       user.lastTradeDate = new Date();
//       await user.save();

//       return res.status(200).json({
//         success: false,
//         message: "Trade failed. Market was volatile.",
//         tradeStatus: "failed",
//         totalSuccessfulTrades: user.totalSuccessfulTrades || 0,
//         totalFailedTrades: user.totalFailedTrades,
//         todayTradeCount: user.todayTradeCount,
//       });
//     }

//     const roi = new Roi({
//       userId,
//       roiAmount,
//       dayCount: 0,
//       investment: mainWalletAmount,
//       // compoundInvestmentAmount: mainWalletAmount + totalIncome,
//       percentage: roiPercent,
//     });
//     await roi.save();

//     user.totalRoi += roiAmount;
//     user.currentEarnings += roiAmount;
//     user.mainWallet += roiAmount
//     user.aiCredits = (user.aiCredits || 0) + 3;
//     user.totalSuccessfulTrades = (user.totalSuccessfulTrades || 0) + 1;
//     user.todayTradeCount = (user.todayTradeCount || 0) + 1;
//     user.lastTradeDate = new Date();
//     await user.save();

//     if (!user.isIncomeBlocked) {
//       await distributeCommissions(user, roiAmount);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "✅ Trade successful!",
//       tradeStatus: "success",
//       roiAmount,
//       totalSuccessfulTrades: user.totalSuccessfulTrades,
//       totalFailedTrades: user.totalFailedTrades || 0,
//       todayTradeCount: user.todayTradeCount,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };


import UserModel from "../models/user.model.js";
import Investment from "../models/investment.model.js";
import RoiLevel from "../models/roiLevel.model.js";
import Roi from "../models/roi.model.js";
import { distributeCommissions } from "./distributeLevelIncomeUpto6LevelBasedOnRoiORAnyIncome.js";

export const triggerAITradeRoi = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const investments = await Investment.find({ userId });

    if (investments.length === 0)
      return res.status(400).json({ success: false, message: "No investment found" });

    const mainWalletAmount = user.mainWallet || 0;
    const totalIncome = user.currentEarnings;
    const maxReturn = mainWalletAmount * 2;

    const roiLevel = await RoiLevel.findOne({ level: user.level });

    if (!roiLevel) {
      return res.status(400).json({
        success: false,
        message: "ROI level not found for user level",
      });
    }

    const roiPercent = roiLevel.roi;
    const roiAmount = (mainWalletAmount * roiPercent) / 100;
    const earningRatio = totalIncome / maxReturn;

    // ----- DAILY TRADE LIMIT CHECK -----
    const level = user.level;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastTradeDate = user.lastTradeDate
      ? new Date(user.lastTradeDate).setHours(0, 0, 0, 0)
      : null;

    if (!lastTradeDate || lastTradeDate !== today.getTime()) {
      user.todayTradeCount = 0;
      user.totalTradeCount = (user.totalTradeCount || 0) + 1;
      user.lastTradeDate = new Date();
    }

    let maxTradesAllowed = 0;
    if (level === 1 || level === 2) {
      maxTradesAllowed = 1;
    } else if (level === 3 || level === 4) {
      maxTradesAllowed = 2;
    } else if (level === 5 || level === 6) {
      maxTradesAllowed = 3;
    }

    if (user.todayTradeCount >= maxTradesAllowed) {
      return res.status(200).json({
        success: false,
        message: `You have reached the max ${maxTradesAllowed} trades for today.`,
        tradeStatus: "limit-reached",
      });
    }

    // ----- ROI INCOME BLOCKED CHECK -----
    if (user.isIncomeBlocked) {
      user.todayTradeCount = (user.todayTradeCount || 0) + 1;
      user.lastTradeDate = new Date();
      await user.save();

      return res.status(200).json({
        success: false,
        message: "Your income is currently blocked. ROI not added.",
        tradeStatus: "income-blocked",
      });
    }

    // ----- ROI FAIL LOGIC -----
    let failTrade = false;

    if ((user.totalSuccessfulTrades || 0) >= 3) {
      if (totalIncome + roiAmount > maxReturn) {
        failTrade = true;
      } else {
        let failChance;
        if (earningRatio < 0.3) {
          failChance = 0.6;
        } else if (earningRatio < 0.6) {
          failChance = 0.3;
        } else if (earningRatio < 0.9) {
          failChance = 0.1;
        } else {
          failChance = 0.6;
        }
        failTrade = Math.random() < failChance;
      }
    }

    if (failTrade) {
      user.totalFailedTrades = (user.totalFailedTrades || 0) + 1;
      user.todayTradeCount = (user.todayTradeCount || 0) + 1;
      user.lastTradeDate = new Date();
      await user.save();

      return res.status(200).json({
        success: false,
        message: "Trade failed. Market was volatile.",
        tradeStatus: "failed",
        totalSuccessfulTrades: user.totalSuccessfulTrades || 0,
        totalFailedTrades: user.totalFailedTrades,
        todayTradeCount: user.todayTradeCount,
      });
    }

    // ----- ROI SUCCESS FLOW -----
    const roi = new Roi({
      userId,
      roiAmount,
      dayCount: 0,
      investment: mainWalletAmount,
      percentage: roiPercent,
    });
    await roi.save();

    user.totalRoi += roiAmount;
    user.dailyRoi += roiAmount;
    user.currentEarnings += roiAmount;
    user.mainWallet += roiAmount;
    user.aiCredits = (user.aiCredits || 0) + 3;
    user.totalSuccessfulTrades = (user.totalSuccessfulTrades || 0) + 1;
    user.todayTradeCount = (user.todayTradeCount || 0) + 1;
    user.lastTradeDate = new Date();
    await user.save();

    await distributeCommissions(user, roiAmount);

    return res.status(200).json({
      success: true,
      message: "✅ Trade successful!",
      tradeStatus: "success",
      roiAmount,
      totalSuccessfulTrades: user.totalSuccessfulTrades,
      totalFailedTrades: user.totalFailedTrades || 0,
      todayTradeCount: user.todayTradeCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

