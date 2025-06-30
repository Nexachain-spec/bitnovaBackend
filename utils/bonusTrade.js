import UserModel from "../models/user.model.js";
import BonusRoi from "../models/bonusroi.model.js";

export const bonusTrade = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await UserModel.findById(userId);

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        const totalInvestment = user.BonusCredit || 0;
        if (totalInvestment <= 0)
            return res.status(400).json({ success: false, message: "No investment found" });

        const roiPercent = user.roiLevel?.roi || 2;

        const totalIncome = user.totalBonusTrade || 0;
        const maxReturn = user.maxReturn || totalInvestment * 3;

        const roiAmount = ((totalInvestment + totalIncome) * roiPercent) / 100;
        const earningRatio = totalIncome / maxReturn;

        // ---------- DAILY TRADE CHECK ----------

        const level = user.level;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastTradeDate = user.lastTradeDate
            ? new Date(user.lastTradeDate)
            : null;
        lastTradeDate?.setHours(0, 0, 0, 0);

        if (!lastTradeDate || lastTradeDate.getTime() !== today.getTime()) {
            user.todayTradeCount = 0;
            user.totalTradeCount = (user.totalTradeCount || 0) + 1;
            user.lastTradeDate = new Date();
            console.log("🔄 Resetting today's trade count");
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

        // ---------- ROI FAIL LOGIC ----------
        let failTrade = false;

        if ((user.totalSuccessfulTrades || 0) < 3) {
            console.log("🎯 Initial 3 trades forced success.");
        } else {
            if (totalIncome + roiAmount > maxReturn) {
                failTrade = true;
                console.log("❌ Fail: Will exceed max return cap");
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
                console.log(`⚖️ EarningRatio: ${earningRatio.toFixed(2)}, FailChance: ${failChance}, FailTrade: ${failTrade}`);
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

        const roi = new BonusRoi({
            userId,
            roiAmount,
            dayCount: 0,
            investment: totalInvestment,
            compoundInvestmentAmount: totalInvestment + totalIncome,
            percentage: roiPercent,
        });
        await roi.save();
        console.log("📝 ROI saved to DB:", roi);

        user.totalBonusTrade = Number((user.totalBonusTrade || 0)) + Number(roiAmount);
        user.bonusTrade = Number(roiAmount);
        await user.save();
        console.log("👤 User updated: totalRoi:", user.totalRoi);
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
        console.error("❌ Server Error in bonusTrade:", err);
        return res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};
