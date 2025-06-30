import { ethers } from "ethers";
import Investment from "./models/Investment.js"; 
import dotenv from "dotenv";
dotenv.config();
const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

const busdAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const busdAbi = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];
const busdContract = new ethers.Contract(busdAddress, busdAbi, provider);

function listenToBusdTransfers() {
    // console.log("🚀 Listening to BUSD Transfers...");

    busdContract.on("Transfer", async (from, to, value, event) => {
        const amount = parseFloat(ethers.formatUnits(value, 18));
        const txHash = event.transactionHash;

        // console.log("🟢 New Transfer:", { from, to, amount, txHash });

        try {
            const exists = await Investment.findOne({ txResponse: txHash });
            if (exists) {
                // console.log("⚠️ Duplicate Tx, skipping save.");
                return;
            }

            const newInvestment = new Investment({
                
                investmentAmount: amount,
                txResponse: txHash,
            });

            await newInvestment.save();
            // console.log("✅ Investment saved to DB");
        } catch (err) {
            // console.error("❌ DB Save Error:", err.message);
        }
    });
}

export default listenToBusdTransfers;