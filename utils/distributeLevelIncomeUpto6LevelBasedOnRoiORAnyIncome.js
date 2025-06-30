import LevelPercentage from "../models/LevelIncomePercentage.model.js";
import Commission from "../models/teamIncome.model.js";
import UserModel from "../models/user.model.js";

// const commissionRatesByLevel = {
//   2: { A: 13, B: 6, C: 2 },
//   3: { A: 14, B: 7, C: 3 },
//   4: { A: 16, B: 8, C: 5 },
//   5: { A: 17, B: 9, C: 7 },
//   6: { A: 19, B: 10, C: 8 },
// };

export const distributeCommissions = async (user, roiAmount) => {
  try {
    // console.log(
    //   `\nDistributing commissions for user: ${user._id}, ROI Amount: ${roiAmount}`
    // );

    const rateDoc = await LevelPercentage.findOne({ level: user.level });
    const rates = rateDoc
      ? { A: rateDoc.A, B: rateDoc.B, C: rateDoc.C, D: rateDoc.D || 0 }
      : { A: 0, B: 0, C: 0, D: 0 };


    const uplineChain = [];
    let current = user;
    for (let i = 0; i < 4; i++) {
      if (!current.sponsorId) {
        // console.log(`Level ${i + 1}: No sponsor found for user ${current._id}`);
        break;
      }

      const sponsor = await UserModel.findById(current.sponsorId);

      if (!sponsor) {
        // console.log(
        //   `Level ${i + 1}: Sponsor not found in DB for user ${current._id
        //   }, sponsorId: ${current.sponserId}`
        // );
        break;
      }

      // console.log(
      //   `Level ${i + 1}: Sponsor found: ${sponsor._id} (for user ${current._id
      //   })`
      // );
      uplineChain.push(sponsor);
      current = sponsor;
    }

    const types = ["A", "B", "C", "D"];

    for (let i = 0; i < uplineChain.length; i++) {
      const uplineUser = uplineChain[i];
      const commissionType = types[i];
      const commissionPct = rates[commissionType] || 0;
      const commissionAmount = (roiAmount * commissionPct) / 100;

      if (uplineUser.isIncomeBlocked) {
        // console.log(`User ${uplineUser._id} income is blocked. Skipping...`);
        continue;
      }

      // console.log(
      //   `Level ${i + 1}: Giving ${commissionAmount} (${commissionPct}%) to ${uplineUser._id
      //   } as type ${commissionType}`
      // );

      uplineUser.currentEarnings += commissionAmount;
      uplineUser.totalEarnings += commissionAmount;
      uplineUser.levelIncome += commissionAmount;
      await uplineUser.save();

      await Commission.create({
        userId: uplineUser._id,
        fromUserId: user._id,
        level: i + 1,
        commissionType,
        commissionPercentage: commissionPct,
        commissionAmount,
        amount: roiAmount,
      });
    }

    // console.log(`Commission distribution complete for user ${user._id}\n`);
  } catch (error) {
    // console.error("❌ Error distributing commissions:", error);
  }
};
