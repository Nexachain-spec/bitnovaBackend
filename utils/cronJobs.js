import cron from "node-cron";
import { runLevelUpgrades } from "./LevelUpgrade.js";

let isUpgradingLevels = false;

// cron.schedule("*/10 * * * * *", async () => {
//   if (isDistributingROI) {
//     console.log("⏳ ROI job already running. Skipping this cycle.");
//     return;
//   }

//   isDistributingROI = true;
//   console.log("🚀 Running distributeRoi...");

//   try {
//     await distributeRoi();
//   } catch (err) {
//     console.error("❌ Error in distributeRoi:", err.message);
//   } finally {
//     isDistributingROI = false;
//   }
// });


cron.schedule("* * * * *", async () => {
    if (isUpgradingLevels) {
        console.log("⏳ Level upgrade job already running. Skipping...");
        return;
    }

    isUpgradingLevels = true;
    console.log("📈 Running runLevelUpgrades...");

    try {
        await runLevelUpgrades();
        console.log("✅ Level upgrades completed.");
    } catch (err) {
        console.error("❌ Error in runLevelUpgrades:", err.message);
    } finally {
        isUpgradingLevels = false;
    }
});


// // cron.schedule("*/2 * * * * *", async () => {
// //     if (isUpgradingLevels) {
// //         console.log("⏳ Level upgrade job already running. Skipping...");
// //         return;
// //     }
// //     isUpgradingLevels = true;
// //     console.log("📈 Running runLevelUpgrades...");

// //     try {
// //         await AiAgentRoi();
// //     } catch (err) {
// //         console.error("❌ Error in runLevelUpgrades:", err.message);
// //     } finally {
// //         isUpgradingLevels = false;
// //     }
// // }, {
// //     scheduled: true,
// //     timezone: "Asia/Kolkata"
// // });



