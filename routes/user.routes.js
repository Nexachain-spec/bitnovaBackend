import express from "express";
import {
  aiAgentInvestment,
  updateProfile,
  depositHistory,
  generate2FAHandler,
  getAiAgentInvestmentsForActive,
  getAllAiPlans,
  getAllAiPlansById,
  getAllAnoucement,
  getAllBanners,
  getAllFundTransferHistory,
  getAllSuppoertMessages,
  getAllTradeHistory,
  getDownLines,
  getMemeberAndTeamData,
  getProfile,
  getTeamCount,
  getUsersCountByLevel,
  initialInvestment,
  LevelIncomeHistory,
  ReferralIncomeHistory,
  reset2FAHandler,
  sendInvitation,
  sendOTPForBep20Address,
  sendOTPForChangeAddress,
  sendOtpForMoneyTransfer,
  sendOtpForPasswordReset,
  setBep20,
  setTrc20,
  setWalletAddress,
  supportMessage,
  swapAmount,
  transferAiAgentToMainWallet,
  transferAmountToAnotherUser,
  userLogin,
  userRegisterWithEmail,
  verify2FAHandler,
  verifyOTP,
  verifyOtpForPassword,
  withdrawalHistory,
} from "../controllers/user.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import { triggerAITradeRoi } from "../utils/triggerAITradeRoi.js";
import { processWithdrawal } from "../controllers/withdrwal.controller.js";
import upload from "../utils/upload.js";
import { bonusTrade } from "../utils/bonusTrade.js";

const router = express.Router();

router.route("/register").post(userRegisterWithEmail);
router.route("/login").post(userLogin);
router.route("/get-downlines").get(IsAuthenticated, getDownLines);
router.route("/get-level-users").get(IsAuthenticated, getUsersCountByLevel);
// router.route("/invest").post(IsAuthenticated, initialInvestment);
router.route("/get-Profile").get(IsAuthenticated, getProfile);
router.route("/verify-otp").post(verifyOTP);
router.route("/place-trade").get(IsAuthenticated, triggerAITradeRoi);
router.route("/get-all-announcement").post(getAllAnoucement);
router
  .route("/sendOtp-forWalletAddress")
  .post(IsAuthenticated, sendOTPForChangeAddress);
router.route("/update-profile").post(IsAuthenticated, updateProfile);
router
  .route("/change-walletAddress")
  .post(IsAuthenticated, sendOTPForChangeAddress);
router.route("/invest").post(IsAuthenticated, initialInvestment);
router.route("/swap-amount").post(IsAuthenticated, swapAmount);
router.route("/withdraw-history").get(IsAuthenticated, withdrawalHistory);
router.route("/deposit-history").get(IsAuthenticated, depositHistory);
router.route("/levelIncome-history").get(IsAuthenticated, LevelIncomeHistory);
router.route("/referalIncome-history").get(IsAuthenticated, ReferralIncomeHistory);
router.route("/user-withdraw").post(IsAuthenticated, processWithdrawal)
router.route("/fund-transfer-history").get(IsAuthenticated, getAllFundTransferHistory)
router.route("/send-otp-for-password-reset").post(sendOtpForPasswordReset)
router.route("/otp-verify-for-reset-password").post(verifyOtpForPassword)
router.route("/get-member-data").post(IsAuthenticated, getMemeberAndTeamData)
router.route("/transfer-funds-otp").post(IsAuthenticated, sendOtpForMoneyTransfer)
router.route("/transfer-funds").post(IsAuthenticated, transferAmountToAnotherUser)
router.route("/generate-2fa").post(IsAuthenticated, generate2FAHandler)
router.route("/verify-2fa").post(IsAuthenticated, verify2FAHandler)
router.route("/send-invitation").post(IsAuthenticated, sendInvitation)
router.route("/reset-2fa").post(IsAuthenticated, reset2FAHandler)
router.post('/support-message', IsAuthenticated, upload.single('file'), supportMessage);
router.get('/get-message-history', IsAuthenticated, getAllSuppoertMessages);
router.post('/updateAccount', IsAuthenticated, setWalletAddress);
router.post('/set-bep20-address', IsAuthenticated, setBep20);
router.get('/send-otp-for-wallet-change', IsAuthenticated, sendOTPForBep20Address);
router.post('/set-trc20-address', IsAuthenticated, setTrc20);
router.get('/get-all-plans', IsAuthenticated, getAllAiPlans);
router.get('/plan/:id', IsAuthenticated, getAllAiPlansById);
router.post('/ai-agent-investment', IsAuthenticated, aiAgentInvestment);
router.route("/investmentDetails").post(IsAuthenticated, aiAgentInvestment);
router.route("/ai-agent-history").get(IsAuthenticated, getAiAgentInvestmentsForActive);
router.get('/get-team', IsAuthenticated, getTeamCount);
router.get('/redeem-ai-agent-amount', IsAuthenticated, transferAiAgentToMainWallet);
router.post('/bonus-trade', IsAuthenticated, bonusTrade);
router.route("/get-all-banners").get(IsAuthenticated, getAllBanners)
router.get('/send-withdrawal-otp', IsAuthenticated, sendOTPForBep20Address);
router.route("/trade-history").get(IsAuthenticated, getAllTradeHistory);



export default router;
