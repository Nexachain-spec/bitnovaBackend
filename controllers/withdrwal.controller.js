import {
    JsonRpcProvider,
    Wallet,
    Contract,
    parseUnits,
    isAddress,
} from "ethers";
import dotenv from "dotenv";
import UserModel from "../models/user.model.js";
import Settings from "../models/settings.model.js";
import WithdrawalLimit from "../models/WithdrawalLimit.model.js";
import { sendWithdrawalApproveEmail, sendWithdrawalConfirmationEmail } from "../utils/sendWithdrawalConfirmationEmail.js";
import bcrypt from "bcrypt"
import Withdrawal from "../models/withdrawal.model.js";

dotenv.config();

const provider = new JsonRpcProvider("https://bsc-dataseed.binance.org/");

const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
// const wallet ="asd"

//const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
const usdtAddress = "0x9791EC5e00FFF1Ac860657B1560189b1259233BB";
const usdtABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address) view returns (uint256)",
];
const usdtContract = new Contract(usdtAddress, usdtABI, wallet);

// export const processWithdrawal = async (req, res) => {
//     const userId = req.user._id;

//     try {
//         const user = await UserModel.findById(userId);
//         if (!user) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "User not found" });
//         }
//         if (user.isWithdrawalblock) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "User withdrawl is block" });

//         }

//         const { userWalletAddress, amount, otp, loginPassword, options } = req.body;

//         if (!userWalletAddress || !amount || !otp || !loginPassword || !options) {
//             return res
//                 .status(400)
//                 .json({
//                     success: false,
//                     message: "All fields are required. Please check your input.",
//                 });
//         }

//         if (!["mainWallet", "additionalWallet"].includes(options)) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid wallet option" });
//         }

//         if (user.otp !== otp || user.otpExpire < Date.now()) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid or expired OTP" });
//         }

//         if (!isAddress(userWalletAddress)) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid wallet address" });
//         }

//         const passwordMatch = await bcrypt.compare(loginPassword, user.password);
//         if (!passwordMatch) {
//             return res
//                 .status(401)
//                 .json({ success: false, message: "Invalid login password" });
//         }

//         const numericAmount = Number(amount);
//         if (isNaN(numericAmount) || numericAmount <= 0) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Invalid amount" });
//         }

//         if (numericAmount < 10) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Minimum withdrawal amount is $10" });
//         }

//         // ---------- 2. Balance checks ----------
//         if (
//             options === "mainWallet" &&
//             user.mainWallet < numericAmount
//         ) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Insufficient balance in main wallet" });
//         }
//         if (
//             options === "additionalWallet" &&
//             user.additionalWallet < numericAmount
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Insufficient balance in additional wallet",
//             });
//         }

//         // ---------- 3. Rule checks ----------
//         const withdrawalRule = await WithdrawalLimit.findOne({ level: user.level });
//         if (!withdrawalRule) {
//             return res
//                 .status(400)
//                 .json({
//                     success: false,
//                     message: "Withdrawal rules not configured for your level",
//                 });
//         }

//         if (numericAmount > withdrawalRule.singleWithdrawalLimit) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Maximum withdrawal amount for your level is $${withdrawalRule.singleWithdrawalLimit}`,
//             });
//         }

//         const now = new Date();
//         const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//         const lastDayOfMonth = new Date(
//             now.getFullYear(),
//             now.getMonth() + 1,
//             0,
//             23,
//             59,
//             59,
//             999
//         );

//         const monthlyWithdrawals = await Withdrawal.find({
//             userId,
//             createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
//         });

//         if (monthlyWithdrawals.length >= withdrawalRule.perMonthWithdrawalCount) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "Monthly withdrawal limit reached" });
//         }

//         // ---------- 4. Fee + on-chain transfer ----------
//         const feePercentage = 10;
//         const feeAmount = (numericAmount * feePercentage) / 100;
//         const netAmount = numericAmount - feeAmount;

//         // const amountWei = parseUnits(netAmount.toString(), 18);
//         const serverBalance = await usdtContract.balanceOf(wallet.address);
//         const amountWei = parseUnits(netAmount.toString(), 18);

//         if (serverBalance < amountWei) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Transaction could not be processed at the moment. Please try again later",
//             });
//         }

//         const tx = await usdtContract.transfer(userWalletAddress, amountWei, {
//             gasLimit: 210000,
//         });
//         const receipt = await tx.wait();
//         const txStatus = receipt.status ? "success" : "failed";

//         // ---------- 5. Record in DB ----------
//         await Withdrawal.create({
//             userId,
//             userWalletAddress,
//             amount: numericAmount,
//             feeAmount,
//             netAmountSent: netAmount,
//             transactionHash: receipt.hash,
//             status: txStatus,
//         });

//         // ---------- 6. Update user balances ----------
//         if (txStatus === "success") {
//             if (options === "mainWallet") {
//                 user.mainWallet -= numericAmount;
//             } else {
//                 user.additionalWallet -= numericAmount;
//             }

//             user.totalPayouts += numericAmount;

//             // invalidate OTP
//             user.otp = null;
//             user.otpExpire = null;

//             await user.save();

//             // ---------- 7. Email notification ----------
//             await sendWithdrawalConfirmationEmail(
//                 user.email,
//                 user.name,
//                 numericAmount,
//                 netAmount,
//                 userWalletAddress,
//                 receipt.hash,
//                 new Date()
//             );
//         }

//         return res.status(200).json({
//             success: txStatus === "success",
//             message: `Withdrawal ${txStatus}. Net Amount: $${amount - feeAmount} (Requested: $${amount}, Fee: $${fee}). TxHash: ${receipt.hash}`,
//         });
//     } catch (error) {
//         return res
//             .status(500)
//             .json({
//                 success: false,
//                 message: error.message || "Failed to process withdrawal",
//             });
//     }
// };



export const processWithdrawal = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isWithdrawalblock) {
            return res.status(403).json({ success: false, message: "User withdrawal is blocked" });
        }

        const { userWalletAddress, amount, otp, loginPassword } = req.body;

        if (!userWalletAddress || !amount || !otp || !loginPassword) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        if (!isAddress(userWalletAddress)) {
            return res.status(400).json({ success: false, message: "Invalid wallet address" });
        }

        const passwordMatch = await bcrypt.compare(loginPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid login password" });
        }

        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount < 10) {
            return res.status(400).json({ success: false, message: "Minimum withdrawal is $10" });
        }

        if (user.mainWallet < numericAmount) {
            return res.status(400).json({ success: false, message: "Insufficient main wallet balance" });
        }

        // Rule check (based on level)
        const withdrawalRule = await WithdrawalLimit.findOne({ level: user.level });
        if (!withdrawalRule) {
            return res.status(400).json({ success: false, message: "No withdrawal rules configured" });
        }

        if (numericAmount > withdrawalRule.singleWithdrawalLimit) {
            return res.status(400).json({
                success: false,
                message: `Max withdrawal allowed is $${withdrawalRule.singleWithdrawalLimit}`,
            });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const monthlyWithdrawals = await Withdrawal.find({
            userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        if (monthlyWithdrawals.length >= withdrawalRule.perMonthWithdrawalCount) {
            return res.status(400).json({ success: false, message: "Monthly limit reached" });
        }

        const fee = (numericAmount * 10) / 100;
        const netAmount = numericAmount - fee;

        user.mainWallet -= numericAmount;
        user.totalPayouts += numericAmount;
        user.otp = null;
        user.otpExpire = null;
        await user.save();

        await Withdrawal.create({
            userId,
            userWalletAddress,
            amount: numericAmount,
            feeAmount: fee,
            netAmountSent: netAmount,
            status: "pending",
            transactionHash: "", // not applicable in manual mode
        });

        await sendWithdrawalConfirmationEmail(
            user.email,
            user.name,
            numericAmount,
            netAmount,
            userWalletAddress,
            new Date()
        );

        return res.status(200).json({
            success: true,
            message: `Withdrawal request submitted successfully. Net amount: $${netAmount}. It will be processed soon.`,
        });

    } catch (error) {
        console.error("Withdrawal Error:", error);
        return res.status(500).json({ success: false, message: "Server error during withdrawal" });
    }
};
export const approveWithdrawal = async (req, res) => {
    const { withdrawalId } = req.body;
    if (!withdrawalId) {
        return res.status(400).json({
            message: "withdrawal ID is required",
            success: false
        })
    }

    try {
        const withdrawal = await Withdrawal.findById(withdrawalId)
        const user = await UserModel.findById({ _id: withdrawal.userId })
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: "Withdrawal not found" });
        }

        if (withdrawal.status !== "pending") {
            return res.status(400).json({ success: false, message: "Withdrawal is not pending" });
        }

        withdrawal.status = "approved";
        await withdrawal.save();
        await sendWithdrawalApproveEmail(user.email,
            user.name,
            withdrawal.amount,
            withdrawal.netAmountSent,
            withdrawal.userWalletAddress,
            new Date())
        return res.status(200).json({ success: true, message: "Withdrawal approved successfully" });

    } catch (error) {
        console.error("Approve Withdrawal Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const rejectWithdrawal = async (req, res) => {
    const { withdrawalId, reason } = req.body;

    try {
        const withdrawal = await Withdrawal.findById(withdrawalId);
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: "Withdrawal not found" });
        }

        if (withdrawal.status !== "pending") {
            return res.status(400).json({ success: false, message: "Withdrawal is not pending" });
        }

        const user = await UserModel.findById(withdrawal.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const amount = withdrawal.amount;

        user.mainWallet += amount;
        user.totalPayouts -= amount;
        if (user.totalPayouts < 0) user.totalPayouts = 0;

        await user.save();

        withdrawal.status = "rejected";
        withdrawal.reason = reason || "Rejected by admin";
        withdrawal.transactionHash = "";
        await withdrawal.save();

        return res.status(200).json({ success: true, message: "Withdrawal rejected and balance reverted" });

    } catch (error) {
        console.error("Reject Withdrawal Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


