import AiAgentInvestment from "../models/AIAGENTINVESTMENT.model.js";
import AiAgentHistory from "../models/AiAgentRoi.model.js";
import UserModel from "../models/user.model.js";

export const AiAgentRoi = async () => {
    try {
        const now = new Date();
        const allInvestment = await AiAgentInvestment.find({});

        if (!allInvestment.length) {
            return;
        }

        for (const investment of allInvestment) {
            const {
                _id,
                userId,
                investedAmount,
                expectedReturn,
                investedAt,
                maturityDate,
                isMatured,
            } = investment;

            const investedDate = new Date(investedAt);
            const maturity = new Date(maturityDate);

            const totalDuration = Math.ceil((maturity - investedDate) / (1000 * 60 * 60 * 24));
            if (totalDuration <= 0) {
                continue;
            }

            const dailyROI = (Number(expectedReturn) - Number(investedAmount)) / totalDuration;

            const creditedDays = await AiAgentHistory.countDocuments({
                investmentId: _id,
                actionType: "ROI_CREDITED",
            });

            const user = await UserModel.findById(userId);
            if (!user) {
                // console.error(`❌ User ${userId} not found for investment ${_id}. Skipping.`);
                continue;
            }

            const isMaturedOrPast = now >= maturity;
            const isFullyCredited = creditedDays >= totalDuration;



            if (isMaturedOrPast && !isMatured && !isFullyCredited) {
                const remainingDays = totalDuration - creditedDays;
                const remainingROI = remainingDays * dailyROI;
                const totalToAdd = Number(remainingROI) + Number(investedAmount);
                await UserModel.findByIdAndUpdate(userId, {
                    $inc: { aiAgentTotal: totalToAdd },
                    $set: { aiAgentDaily: dailyROI },
                });

                if (remainingROI > 0) {
                    await AiAgentHistory.create({
                        investmentId: _id,
                        userId,
                        actionType: "ROI_CREDITED",
                        amount: remainingROI,
                    });
                }

                await AiAgentHistory.create({
                    investmentId: _id,
                    userId,
                    actionType: "INVESTMENT_MATURED",
                    amount: investedAmount,
                });

                await AiAgentInvestment.findByIdAndUpdate(_id, {
                    isMatured: true,
                    maturedAt: now,
                });

                // console.log(`✅ Final ROI + Invested Amount added for investment ${_id}`);
                continue;
            }

            if (isFullyCredited || isMaturedOrPast) {
                if (!isMatured) {
                    await AiAgentInvestment.findByIdAndUpdate(_id, { isMatured: true });
                }
                // console.log(`ℹ️ Investment ${_id} matured or fully credited.`);
                continue;
            }

            await UserModel.findByIdAndUpdate(userId, {
                $inc: { aiAgentTotal: dailyROI },
                $set: { aiAgentDaily: dailyROI },
            });

            await AiAgentHistory.create({
                investmentId: _id,
                userId,
                actionType: "ROI_CREDITED",
                amount: dailyROI,
            });

            // console.log(
            //     `🟢 Daily ROI ${dailyROI.toFixed(2)} credited to user ${userId} (Day ${creditedDays + 1}/${totalDuration})`
            // );
        }

        // console.log("🎉 Daily ROI calculation complete ✅");
    } catch (error) {
        // console.error("❌ Error in AiAgentRoi:", error.message);
    }
};
