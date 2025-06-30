// const { ethers } = require("ethers");
import { ethers } from "ethers";
// const { UserModel } = require("../models/user.model");
import UserModel from "../models/user.model.js";
import WithdrawalRequestModel from "../models/withdrawal.model.js";
// const { TransactionModel } = require("../models/transaction.model");
// const { generateTxnId } = require("../utils/generateRandomReferralLink");

// ✅ Set Up Provider & Wallet
const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const usdtAbi = [
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 value) public returns (bool)"
];

// exports.BalanceCheck = async (req, res) => {
//     try {
//         const usdtContract = new ethers.Contract(process.env.USDT_CONTRACT_ADDRESS, usdtAbi, wallet);

//         // bnb
//         const bnbBalance = await provider.getBalance(wallet.address);
//         const formattedBNB = ethers.formatEther(bnbBalance);

//         // usdt
//         const usdtBalance = await usdtContract.balanceOf(wallet.address);
//         const formattedUSDT = ethers.formatUnits(usdtBalance, 18);

//         // RESPONSE
//         res.json({ bnb: formattedBNB, usdt: formattedUSDT });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

export const WithdrawalUsdt = async ({ req, res, userId, walletAddress, amount }) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!walletAddress || !amount) {
            return res.status(400).json({ error: "Recipient and amount are required" });
        }

        const usdtContract = new ethers.Contract(process.env.USDT_CONTRACT_ADDRESS, usdtAbi, wallet);
        const decimals = 18;
        const amountToSend = ethers.parseUnits((Number(amount) * 0.95).toString(), decimals);

        // 🔹 Check USDT Balance
        const walletUsdtBalance = await usdtContract.balanceOf(wallet.address);
        if (walletUsdtBalance < amountToSend) {
            return res.status(400).json({ status: false, message: "Not enough USDT balance for withdrawal in admin wallet" });
        }

        // 🔹 Estimate Gas
        const gasLimit = await usdtContract.transfer.estimateGas(walletAddress, amountToSend);
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits("5", "gwei");
        const estimatedGasFee = gasLimit * gasPrice;

        // 🔹 Check BNB Balance for Gas Fees
        const walletBalance = await provider.getBalance(wallet.address);
        if (walletBalance < estimatedGasFee) {
            return res.status(400).json({ status: false, message: "Not enough BNB for gas fees in admin wallet" });
        }

        // 🔹 Execute Transaction
        const tx = await usdtContract.transfer(walletAddress, amountToSend, { gasLimit, gasPrice });
        await tx.wait();

        // const txnId = generateTxnId();
        // const transaction = await TransactionModel.create({
        //     userId: user._id,
        //     amount: Number(amount),
        //     clientAddress: walletAddress,
        //     mainAddress: wallet.address,
        //     hash: tx.hash,
        //     transactionID: txnId,
        //     type: "withdrawal"
        // })

        // 🔹 Save Transaction to Database
        const newWithdrawal = new WithdrawalRequestModel({
            userId: user._id,
            gasLimit: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
            hash: tx.hash,
            value: amount,
            type: "USDT_Withdrawal",
            mainAddress: wallet.address,
            clientAddress: walletAddress,
            amount: amount,
            status: "Completed",
            transactionId: txnId
        });

        user.account.currentIncome -= amount;
        user.withdrawal.push(newWithdrawal);
        await user.save();
        await newWithdrawal.save();

        return res.status(200).json({
            status: true,
            message: "Withdrawal Transaction Successful!",
            hash: tx.hash,
            gasLimit: gasLimit.toString(),
            gasPrice: gasPrice.toString(),
        });
    } catch (error) {
        console.log("❌ Error during USDT withdrawal:", error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

