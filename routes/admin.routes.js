import express from "express";
import {
  addLevelCommission,
  adminLogin,
  adminRegister,
  adminSendRewards,
  allroiIncomeHistory,
  changeDepositAmount,
  changeReferralPercentage,
  changeWithdrawalLimit,
  createAgentPlan,
  createLevelRequirement,
  createOrUpdateRoiLevel,
  createRoiLevel,
  deleteBanner,
  depositLimitAmount,
  getAllBanners,
  getAllIncomes,
  getAllInvestedUsers,
  getAllLevelIncomeHistory,
  getAllReferalBonusHistory,
  getAllTickesHistory,
  getAllUsers,
  getAllWithdrawalHistory,
  getAllWithdrawalLimits,
  getAnnoucement,
  getProfile,
  ticketApprove,
  ticketReject,
  unblockUserLogin,
  updateLevelRequirement,
  updateReferralAmount,
  uploadBanner,
  upsertWithdrawalLimit,
  adminTopUp,
  blockUser,
  toggleIsWithdrawalBlock,
  adminUpdateUser,
  adminTopUpHistory,
  incomeBlock,

} from "../controllers/admin.controller.js";
import { isAdminAuthenticated } from "../middlewares/adminMiddleware.js";
import { getAllAnoucement, getAllStakeInvestmentHistory } from "../controllers/user.controller.js";
import upload from "../utils/upload.js";
import { approveWithdrawal, rejectWithdrawal } from "../controllers/withdrwal.controller.js";

const router = express.Router();

router.route("/login").post(adminLogin);
router.route("/register").post(adminRegister);
router
  .route("/direct-percentage-change")
  .post(isAdminAuthenticated, changeReferralPercentage);
router
  .route("/change-referral")
  .post(isAdminAuthenticated, updateReferralAmount);

router.route("/roi-create").post(isAdminAuthenticated, createRoiLevel);
router.route("/roi-update").post(isAdminAuthenticated, createOrUpdateRoiLevel);
router
  .route("/level-percentage")
  .post(isAdminAuthenticated, createOrUpdateRoiLevel);
router.route("/level-income").post(isAdminAuthenticated, addLevelCommission);
router
  .route("/level-reuirement-schema")
  .post(isAdminAuthenticated, createLevelRequirement);
router
  .route("/level-reuirement-update")
  .patch(isAdminAuthenticated, updateLevelRequirement);

router
  .route("/create-withdrwal-limit")
  .post(isAdminAuthenticated, upsertWithdrawalLimit);

router
  .route("/getAll-withdrwal-limit")
  .get(isAdminAuthenticated, getAllWithdrawalLimits);
router.route("/unblock-user-with-amount")
  .post(isAdminAuthenticated, adminTopUp);
router.route("/block-user").post(isAdminAuthenticated, blockUser);
router.route("/unblock-user").post(isAdminAuthenticated, unblockUserLogin);
router.route("/block-unblock-withdrawl")
  .post(isAdminAuthenticated, toggleIsWithdrawalBlock);
router
  .route("/change-withdrwal-limit")
  .get(isAdminAuthenticated, changeWithdrawalLimit);
router.route("/announement").post(isAdminAuthenticated, getAnnoucement);
router.route("/get-all-announcement").get(getAllAnoucement);
router.route("/reward-given").post(isAdminAuthenticated, adminSendRewards);
router.route("/deposit").post(isAdminAuthenticated, depositLimitAmount);
router.route("/change-deposit").put(isAdminAuthenticated, changeDepositAmount);
router.route("/getAllUsers").get(isAdminAuthenticated, getAllUsers);
router.route("/getAllReferalBonus-history").get(isAdminAuthenticated, getAllReferalBonusHistory);
router.route("/getProfile").get(isAdminAuthenticated, getProfile);
router.route("/getAllInvestedUsers").get(isAdminAuthenticated, getAllInvestedUsers);
router.route("/get-roi-history").get(isAdminAuthenticated, allroiIncomeHistory);
router.route("/getAllLevelIncome-history").get(isAdminAuthenticated, getAllLevelIncomeHistory);
router.route("/getAllIncomes").get(isAdminAuthenticated, getAllIncomes);
router.route("/change-referral-percentage").put(isAdminAuthenticated, changeReferralPercentage);
router.route("/create-agent-plan").post(isAdminAuthenticated, createAgentPlan)
router.route("/upload-banner").post(isAdminAuthenticated, upload.single('file'), uploadBanner)
router.route("/get-banners").get(isAdminAuthenticated, getAllBanners)
router.route("/support-in-process").get(isAdminAuthenticated, getAllTickesHistory)
router.route("/support/status/approve/:ticketId").post(isAdminAuthenticated, ticketApprove)
router.route("/support/status/reject/:ticketId").post(isAdminAuthenticated, ticketReject)
router.route("/unblock-login-user/:id").post(isAdminAuthenticated, unblockUserLogin)
router.route("/withdrawal-reports").get(isAdminAuthenticated, getAllWithdrawalHistory)
router.delete("/delete-banner/:id", isAdminAuthenticated, deleteBanner);
router.route("/withdrawal-approve").post(isAdminAuthenticated, approveWithdrawal)
router.route("/withdrawal-reject").post(isAdminAuthenticated, rejectWithdrawal)
router.route("/update-user-profile").put(isAdminAuthenticated, adminUpdateUser)
router.route("/admin-topup").post(isAdminAuthenticated, adminTopUp)
router.route("/admin-topup-history").get(isAdminAuthenticated, adminTopUpHistory)
router.route("/income-toggle-status").post(isAdminAuthenticated, incomeBlock)
router.route("/get-all-stake-history").get(isAdminAuthenticated, getAllStakeInvestmentHistory);


export default router;
