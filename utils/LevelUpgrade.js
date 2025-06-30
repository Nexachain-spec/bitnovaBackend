import { CloudflareProvider } from "ethers";
import UserModel from "../models/user.model.js";
import { calculateTeams } from "./calculateTeam.js";
import { sendLevelNotification } from "./sendLevelNotification.js";
import LevelRequirementSchema from "../models/LevelrequirementSchema.model.js";


const upgradeMessage = (user, newLevel) => `
  <h2>🎉 Congratulations, ${user.name || "User"}! 🎉</h2>
  <p>We are excited to inform you that your account has been <strong>upgraded</strong> to <strong>Level ${newLevel}</strong>.</p>
  <p>Keep up the great work and continue to earn AI credits and grow your team!</p>
  <br/>
  <p><strong>New AI Credits balance:</strong> ${user.aiCredits}</p>
  <p>If you have any questions, feel free to reach out to our support team.</p>
  <br/>
  <p>Best regards,<br/>The Team</p>
`;
const downgradeMessage = (user, newLevel) => `
  <h2>⚠️ Important Notice, ${user.name || "User"} ⚠️</h2>
  <p>We want to inform you that your account has been <strong>downgraded</strong> to <strong>Level ${newLevel}</strong>.</p>
  <p>This happened because some requirements were not met, such as AI credits, investments, or team activity.</p>
  <p>Please review your account and take action to regain your previous level.</p>
  <br/>
  <p>If you need assistance, our support team is here to help.</p>
  <br/>
  <p>Best wishes,<br/>The Team</p>
`;

export const runLevelUpgrades = async () => {
  // console.log("🚀 Starting runLevelUpgrades...");
  const now = new Date();

  const users = await UserModel.find({});
  const requirements = await LevelRequirementSchema.find({});
  // console.log(`🔄 Checking ${users.length} users for level up…`);

  for (const user of users) {
    const current = user.level || 0;
    const next = current + 1;

    // console.log(`\n👤 User ${user._id}: Checking Level ${current} → ${next}`);

    const req = requirements.find((r) => r.level === next);
    if (!req) {
      // console.log(`⛔ No requirement found for level ${next}, skipping...`);
      continue;
    }

    const totalIncome =
      (user.additionalWallet || 0) +
      (user.mainWallet || 0)

    if (totalIncome < req.invest) {
      // console.log(`❌ Earnings too low. Required ${req.invest}, got ${totalIncome}`);
      continue;
    }

    const haveCredits = user.aiCredits || 0;
    // console.log(`🧠 AI Credits: ${haveCredits}, Required: ${req.aiCredits}`);

    if (haveCredits < req.aiCredits) {
      // console.log(`❌ Not enough AI credits. Required ${req.aiCredits}, got ${haveCredits}`);
      continue;
    }

    if (req.timelineDays > 0 && user.lastUpgradeAt) {
      const windowEnd = new Date(
        user.lastUpgradeAt.getTime() + req.timelineDays * 24 * 60 * 60 * 1000
      );
      // console.log(`⏳ Timeline Check: ends at ${windowEnd.toISOString()}`);

      if (now > windowEnd) {
        // console.log(`❌ Timeline expired. Skipping upgrade.`);
        continue;
      }
    }

    // console.log(`✅ Timeline & requirements passed. Calculating teams...`);
    const { teamA, teamB, teamC } = await calculateTeams(user._id);
    const countA = teamA.length;
    const countBC = teamB.length + teamC.length;

    // console.log(`👥 Team A: ${countA}/${req.activeA}, Team B+C: ${countBC}/${req.activeBC}`);

    if (countA < req.activeA || countBC < req.activeBC) {
      // console.log(`❌ Team requirements not met. Skipping...`);
      continue;
    }

    // console.log(`🎯 All checks passed. Upgrading user...`);
    user.level = next;
    user.lastUpgradeAt = now;
    user.aiCredits = haveCredits - req.aiCredits;

    try {
      await user.save();
      // console.log(`💾 User saved with level ${next}`);
    } catch (err) {
      // console.error(`❌ Failed to save user ${user._id}:`, err.message);
      continue;
    }

    try {
      // console.log(`📧 Sending email to ${user.email}`);
      const msg = upgradeMessage(user, next);
      // console.log(`✉️ Message:\n${msg}`);
      await sendLevelNotification(user.email, "Level Upgrade Notification", msg);
      // console.log(`✅ Email sent to ${user.email}`);
    } catch (err) {
      // console.error(`❌ Failed to send email to ${user.email}:`, err.message);
    }

    // console.log(`🎉 User ${user._id} upgraded to Level ${next}, AI Credits left: ${user.aiCredits}`);
  }

  // console.log("🏁 Level upgrade job completed.");
};

export const runLevelDowngrades = async () => {
  const users = await UserModel.find({});
  const requirements = await LevelRequirementSchema.find({});
  const now = new Date();

  // console.log(`🔄 Checking ${users.length} users for downgrade…`);

  for (const user of users) {
    const currentLevel = user.level || 0;

    if (currentLevel === 0) continue;

    const req = requirements.find(r => r.level === currentLevel);
    if (!req) {
      // console.log(` • No level requirement found for Level ${currentLevel}`);
      continue;
    }

    const totalIncome = (user.totalInvestment || 0) + (user.totalEarnings || 0) + (user.stakeAmount || 0);
    const aiCredits = user.aiCredits || 0;
    const { teamA, teamB, teamC } = await calculateTeams(user._id);
    const countA = teamA.length;
    const countBC = teamB.length + teamC.length;

    const isRequirementMet = (
      totalIncome >= req.invest &&
      aiCredits >= req.aiCredits &&
      countA >= req.activeA &&
      countBC >= req.activeBC
    );

    if (!isRequirementMet) {
      user.level = currentLevel - 1;
      user.lastUpgradeAt = now;
      await user.save();
      await sendLevelNotification(
        user.email,
        "Level Downgrade Notification",
        downgradeMessage(user, user.level)
      );
      // console.log(` ⬇️ Downgraded user ${user._id} to Level ${user.level}`);
    }
  }
};