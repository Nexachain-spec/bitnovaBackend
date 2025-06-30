import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import Investment from "../models/investment.model.js";
import Aroi from "../models/roi.model.js";
import Support from "../models/support.model.js";
import DirectreferalPercentage from "../models/incomePercentage.model.js";
import ReferalBonus from "../models/referalBonus.js";
import Withdrawal from "../models/withdrawal.model.js";
import RoiLevel from "../models/roiLevel.model.js";
import LevelPercentage from "../models/LevelIncomePercentage.model.js";
// import LevelrequirementSchemaModel from "../models/LevelrequirementSchema.model.js";
// import LevelRequirementSchema from "../models/LevelrequirementSchema.model.js";
import Roi from "../models/roi.model.js";
import Commission from "../models/teamIncome.model.js";
import WithdrawalLimit from "../models/WithdrawalLimit.model.js";
import AnnouncementModel from "../models/Annoucement.model.js";
import AnnoucementModel from "../models/Annoucement.model.js";
import AdminReward from "../models/adminRewar.model.js";
import DepositModel from "../models/deposit.model.js";
import ReferralPercentageChangeModel from "../models/directreferralPercentage.model.js";
import AIAgentPlan from "../models/AIAgentPlan.model.js";
import cloudinary from "../utils/cloudinary.js";
import Banner from "../models/banner.model.js";
import { WithdrawalUsdt } from "../utils/withdrawUSDT.js";
import { generateRandomTxResponse } from "../utils/Random.js";
import AdminTopUp from "../models/adminTopUp.model.js";

export const adminRegister = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All Feild are requireds",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      email,
      password: hashPassword,
    });
    if (!newAdmin) {
      return res.status(400).json({
        message: "User Not Created",
        success: false,
      });
    }
    const admin = await newAdmin.save();

    return res.status(200).json({
      message: "Register Successfull",
      success: true,
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const user = await Admin.findOne({ email: email.toLowerCase() }); // Consider case-insensitive search
    if (!user) {
      return res.status(401).json({
        // 401 Unauthorized might be more appropriate
        message: "User not found",
        success: false,
      });
    }

    // Compare passwords
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie and send response
    return res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: "none",
      })
      .status(200)
      .json({
        success: true,
        token,
        data: {
          _id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
          // Only return necessary fields, avoid sending password hash
        },
      });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: error.message || "Server error",
      success: false,
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.admin;
    if (!userId) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const user = await Admin.findById(userId);
    if (!user) {
      return res.status(200).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User Profile",
      data: user,
      success: true,
    });
  } catch (error) { }
};
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.admin._id;
    const admin = await Admin.findById(userId);
    if (!admin) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const users = await UserModel.find({}).populate('sponsorId','username name');

    if (!users) {
      return res.status(200).json({
        message: "No Users Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Users",
      data: users,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getAllHelpAndSupportHistory = async (req, res) => {
  try {
    const userId = req.admin._id;
    const admin = await Admin.findById(userId);
    if (!admin) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const supportHistory = await Support.find({}).populate("userId", [
      "username",
      "email",
    ]);
    if (!supportHistory) {
      return res.status(200).json({
        message: "No Support History Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Support History",
      data: supportHistory,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const createPlan = async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name || !amount) {
      return res.status(200).json({
        message: "All feilds are required",
        success: false,
      });
    }

    const plan = PlanModel.create({
      name,
      planAmount: amount,
    });
    if (!plan) {
      return res.status(200).json({
        message: "Plan not created",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Plan Created",
      success: true,
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getAllIncomes = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const totalUsers = await UserModel.countDocuments();

    const investments = await Investment.find({});
    const totalInvestment = investments.reduce(
      (sum, inv) => sum + inv.investmentAmount,
      0
    );
    const todayInvestments = await Investment.find({
      investmentDate: { $gte: todayStart, $lte: todayEnd },
    });
    const todayInvestment = todayInvestments.reduce(
      (sum, inv) => sum + inv.investmentAmount,
      0
    );

    const rois = await Aroi.find({});
    const totalRoi = rois.reduce((sum, roi) => sum + roi.roiAmount, 0);

    const todayRois = await Aroi.find({
      creditedOn: { $gte: todayStart, $lte: todayEnd },
    });
    const todayRoi = todayRois.reduce((sum, roi) => sum + roi.roiAmount, 0);

    const referrals = await ReferalBonus.find({});
    const totalDirectReferral = referrals.reduce(
      (sum, ref) => sum + ref.amount,
      0
    );
    const todayReferrals = await ReferalBonus.find({
      date: { $gte: todayStart, $lte: todayEnd },
    });
    const todayDirectReferral = todayReferrals.reduce(
      (sum, ref) => sum + ref.amount,
      0
    );

    const withdrawals = await Withdrawal.find({});
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const todayWithdrawals = await Withdrawal.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const todayWithdrawal = todayWithdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    );

    // ✅ Total and Today's Level Income
    const levelIncomes = await Commission.find({});
    const totalLevelIncome = levelIncomes.reduce(
      (sum, lvl) => sum + lvl.amount,
      0
    );

    const todayLevelIncomes = await Commission.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const todayLevelIncome = todayLevelIncomes.reduce(
      (sum, lvl) => sum + lvl.amount,
      0
    );

    return res.status(200).json({
      message: "Platform Income Summary",
      success: true,
      data: {
        totalUsers,
        totalInvestment,
        todayInvestment,
        totalRoi,
        todayRoi,
        totalDirectReferral,
        todayDirectReferral,
        totalWithdrawals,
        todayWithdrawal,
        totalLevelIncome,
        todayLevelIncome,
      },
    });
  } catch (error) {
    // console.error("Error in getAllIncomes:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const getAllWithdrawals = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const withdrawals = await Withdrawal.find({}).populate("userId", [
      "username",
      "email",
    ]);
    if (!withdrawals) {
      return res.status(200).json({
        message: "No Withdrawals Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Withdrawals",
      data: withdrawals,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getAllInvestedUsers = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const investedUsers = await Investment.find({}).populate("userId", [
      "username",
      "email",
      "name",
    ]);
    if (!investedUsers) {
      return res.status(200).json({
        message: "No Invested Users Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Invested Users",
      data: investedUsers,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getAllReferalBonusHistory = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const referalBonusHistory = await ReferalBonus.find({}).populate([
      {
        path: "userId",
        select: "username email name",
      },
      {
        path: "fromUser",
        select: "username email name",
      },
      {
        path: "investmentId",
        select: "investmentAmount"
      }
    ]);

    if (!referalBonusHistory) {
      return res.status(200).json({
        message: "No Referal Bonus History Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Referal Bonus History",
      data: referalBonusHistory,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const allroiIncomeHistory = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const roiIncomeHistory = await Roi.find({}).populate("userId", [
      "username",
      "email",
      "name",
    ]);
    if (!roiIncomeHistory) {
      return res.status(200).json({
        message: "No ROI Income History Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All ROI Income History",
      data: roiIncomeHistory,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getAllLevelIncomeHistory = async (req, res) => {
  try {
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false
      });
    }

    const history = await Commission.find({})
      .populate("userId", "username")
      .populate("fromUserId", "username");

    if (!history || history.length === 0) {
      return res.status(200).json({
        message: "No Level Income History Found",
        data: [],
        success: true
      });
    }

    return res.status(200).json({
      message: "All Level Income History Fetched Successfully",
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something went wrong while fetching level income history.",
      success: false
    });
  }
};
export const getAllWithdrawalHistory = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const withdrawalHistory = await Withdrawal.find({}).populate("userId", [
      "username",
      "email",
      "name",
    ]);
    if (!withdrawalHistory) {
      return res.status(200).json({
        message: "No Withdrawal History Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Withdrawal History",
      data: withdrawalHistory,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getAllTickesHistory = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const ticketHistory = await Support.find({}).populate("userId", [
      "username",
      "email",
      "name",
    ]);
    if (!ticketHistory) {
      return res.status(200).json({
        message: "No Ticket History Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Ticket History",
      data: ticketHistory,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const ticketApprove = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!ticketId || !message) {
      return res.status(400).json({
        message: "Ticket Id && message are required",
        success: false,
      });
    }

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }

    ticket.status = "Approved";
    ticket.response = message;
    await ticket.save();

    return res.status(200).json({
      message: "Ticket Approved Successfully",
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const ticketReject = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!ticketId || !message) {
      return res.status(400).json({
        message: "Ticket Id  & message are required",
        success: false,
      });
    }

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }

    ticket.status = "Rejected";
    ticket.response = message;
    await ticket.save();

    return res.status(200).json({
      message: "Ticket Rejected Successfully",
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const allwithdrwalHitory = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const withdrawalHistory = await Withdrawal.find({}).populate("userId", [
      "username",
      "email",
      "name",
    ]);
    if (!withdrawalHistory) {
      return res.status(200).json({
        message: "No Withdrawal History Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Withdrawal History",
      data: withdrawalHistory,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { withdrawalId, status } = req.params;

    if (!withdrawalId || !status) {
      return res.status(400).json({
        message: "Withdrawal ID and Status are required",
        success: false,
      });
    }

    // Allow only 'approved' or 'rejected'
    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid status value. Only 'approved' or 'rejected' allowed.",
        success: false,
      });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal not found",
        success: false,
      });
    }

    withdrawal.status = status.toLowerCase();
    await withdrawal.save();

    return res.status(200).json({
      message: `Withdrawal ${status} successfully`,
      success: true,
      data: withdrawal,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const changeReferralPercentage = async (req, res) => {
  try {
    const { percentage } = req.body;

    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      return res.status(400).json({
        message: "Percentage must be a number between 0 and 100",
        success: false,
      });
    }

    const percent = await DirectreferalPercentage.findOneAndUpdate(
      {},
      { directReferralPercentage: percentage },
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: "Referral percentage updated successfully",
      data: percent,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
      success: false,
    });
  }
};
export const updateReferralAmount = async (req, res) => {
  try {
    const { percent } = req.body;

    if (!percent) {
      return res.status(400).json({
        message: "Percent is required",
        success: false,
      });
    }
    const oldPercentage = await DirectreferalPercentage.find({})

    const updatedPercent = await DirectreferalPercentage.findOneAndUpdate(
      {},
      { directReferralPercentage: percent },
      { new: true }
    );
    await ReferralPercentageChangeModel.create({
      oldPercentage: oldPercentage.directReferralPercentage,
      newPercentage: percent,
      date: Date.now()
    })

    if (!updatedPercent) {
      return res.status(404).json({
        message: "No existing percentage found to update",
        success: false,
      });
    }

    res.status(200).json({
      message: "Referral percentage updated successfully",
      data: updatedPercent,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating referral percentage",
      error: error.message,
      success: false,
    });
  }
};
export const createRoiLevel = async (req, res) => {
  try {
    const { level, minInvestment, maxInvestment, roi, teamA, teamBAndC } =
      req.body;

    if (
      !level ||
      !minInvestment ||
      !maxInvestment ||
      roi === undefined ||
      teamA === undefined ||
      teamBAndC === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existing = await RoiLevel.findOne({ level });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Level ${level} already exists`,
      });
    }

    const newLevel = await RoiLevel.create({
      level,
      minInvestment,
      maxInvestment,
      roi,
      teamA,
      teamBAndC,
    });

    res.status(201).json({
      success: true,
      message: "ROI Level created successfully",
      data: newLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
export const createOrUpdateRoiLevel = async (req, res) => {
  try {
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const {
      levelId,
      level,
      minInvestment,
      maxInvestment,
      roi,
      teamA,
      teamBAndC,
    } = req.body;

    if (
      !level ||
      !minInvestment ||
      !maxInvestment ||
      !roi ||
      teamA === undefined ||
      teamBAndC === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: level, minInvestment, maxInvestment, roi, teamA, teamBAndC",
      });
    }

    if (levelId) {
      const roiLevel = await RoiLevel.findById(levelId);

      if (!roiLevel) {
        return res.status(404).json({
          success: false,
          message: "ROI Level not found",
        });
      }

      roiLevel.level = level;
      roiLevel.minInvestment = minInvestment;
      roiLevel.maxInvestment = maxInvestment;
      roiLevel.roi = roi;
      roiLevel.teamA = teamA;
      roiLevel.teamBAndC = teamBAndC;

      await roiLevel.save();

      return res.status(200).json({
        success: true,
        message: "ROI Level updated successfully",
        data: roiLevel,
      });
    }
    // Else: Create new
    else {
      const newRoiLevel = new RoiLevel({
        level,
        minInvestment,
        maxInvestment,
        roi,
        teamA,
        teamBAndC,
      });

      await newRoiLevel.save();

      return res.status(201).json({
        success: true,
        message: "ROI Level created successfully",
        data: newRoiLevel,
      });
    }
  } catch (error) {
    // console.error("Error in ROI Level operation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const addLevelCommission = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { level, A, B, C } = req.body;
    if (
      typeof level !== "number" ||
      typeof A !== "number" ||
      typeof B !== "number" ||
      typeof C !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide numeric level, A, B, and C fields",
      });
    }

    const existing = await LevelPercentage.findOne({ level });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Level ${level} already exists—use PUT /levels/${level} to update it.`,
      });
    }

    const doc = new LevelPercentage({ level, A, B, C });
    await doc.save();

    return res.status(201).json({
      success: true,
      message: `Level ${level} commission added.`,
      data: doc,
    });
  } catch (err) {
    // console.error("Error adding level commission:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const updateLevelCommission = async (req, res) => {
  try {
    const adminId = req.admin?._id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const levelParam = Number(req.params.level);
    if (isNaN(levelParam)) {
      return res.status(400).json({
        success: false,
        message: "Level param must be a number",
      });
    }

    const { A, B, C } = req.body;
    const updateFields = {};
    if (A !== undefined) {
      if (typeof A !== "number") {
        return res.status(400).json({
          success: false,
          message: "A must be a number",
        });
      }
      updateFields.A = A;
    }
    if (B !== undefined) {
      if (typeof B !== "number") {
        return res.status(400).json({
          success: false,
          message: "B must be a number",
        });
      }
      updateFields.B = B;
    }
    if (C !== undefined) {
      if (typeof C !== "number") {
        return res.status(400).json({
          success: false,
          message: "C must be a number",
        });
      }
      updateFields.C = C;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update: provide at least one of A, B, or C",
      });
    }

    const updated = await LevelPercentage.findOneAndUpdate(
      { level: levelParam },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Level ${levelParam} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Level ${levelParam} commissions updated`,
      data: updated,
    });
  } catch (err) {
    // console.error("Error updating level commission:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const createLevelRequirement = async (req, res) => {
  try {
    const { level, invest, aiCredits, activeA, activeBC, timelineDays } =
      req.body;

    if (typeof level !== "number") {
      return res.status(400).json({ message: "Level must be a number." });
    }

    const existing = await LevelRequirementSchema.findOne({ level });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Requirement for this level already exists." });
    }

    const newRequirement = await LevelRequirementSchema.create({
      level,
      invest,
      aiCredits,
      activeA,
      activeBC,
      timelineDays,
    });

    res.status(201).json({
      message: "Requirement created successfully",
      data: newRequirement,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating requirement", error: error.message });
  }
};
export const updateLevelRequirement = async (req, res) => {
  try {
    const { level, invest, aiCredits, activeA, activeBC, timelineDays } =
      req.body;

    if (level === undefined) {
      return res.status(400).json({ message: "Level is required" });
    }

    const updatedRequirement = await LevelRequirementSchema.findOneAndUpdate(
      { level },
      { level, invest, aiCredits, activeA, activeBC, timelineDays },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Requirement updated or created successfully",
      data: updatedRequirement,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating requirement", error: error.message });
  }
};
export const upsertWithdrawalLimit = async (req, res) => {
  try {
    const { level, singleWithdrawalLimit, perMonthWithdrawalCount } = req.body;

    const updated = await WithdrawalLimit.findOneAndUpdate(
      { level },
      { singleWithdrawalLimit, perMonthWithdrawalCount },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Limit for level ${level} saved/updated successfully`,
      data: updated,
    });
  } catch (error) {
    // console.error("Error in upsertWithdrawalLimit:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getAllWithdrawalLimits = async (req, res) => {
  try {
    const limits = await WithdrawalLimit.find().sort({ level: 1 });

    res.status(200).json({
      success: true,
      data: limits,
    });
  } catch (error) {
    // console.error("Error in getAllWithdrawalLimits:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const changeWithdrawalLimit = async (req, res) => {
  try {
    const { level, singleWithdrawalLimit, perMonthWithdrawalCount } = req.body;

    if (level === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Level is required" });
    }

    const existing = await WithdrawalLimit.findOne({ level });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Level not found" });
    }

    if (singleWithdrawalLimit !== undefined) {
      existing.singleWithdrawalLimit = singleWithdrawalLimit;
    }

    if (perMonthWithdrawalCount !== undefined) {
      existing.perMonthWithdrawalCount = perMonthWithdrawalCount;
    }

    await existing.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal limit updated for level ${level}`,
      data: existing,
    });
  } catch (error) {
    // console.error("Error in changeWithdrawalLimit:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getAnnoucement = async (req, res) => {
  try {
    const { image, title, description } = req.body;

    if (!image || !title || !description) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const newAnnouncement = new AnnoucementModel({
      image,
      title,
      description,
    });

    await newAnnouncement.save();

    return res.status(201).json({
      message: "Announcement created successfully",
      success: true,
      data: newAnnouncement,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
export const adminSendRewards = async (req, res) => {
  try {
    const adminId = req.admin._id;
    if (!adminId) {
      return res.status(401).json({
        message: "Admin Access Required",
        success: false,
      });
    }
    const { amount, message, userId } = req.body;
    if (!amount || !message || !userId) {
      return res.status(401).json({
        message: "All feilds are required",
        success: false,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    user.rewards += amount;
    user.currentEarnings += rewards;
    user.save();
    await AdminReward.create({
      amount,
      userId: user._id,
    });
    return res.status(200).json({
      message: `Reward has been given to {${user.username} user `,
      success: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in Sending Reward to User",
      success: false,
    });
  }
};
export const depositLimitAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
        success: false,
      });
    }
    const deposit = await DepositModel.create({
      amount,
    });
    return res.status(200).json({
      message: "Deposit Amount Created",
      success: false,
      data: deposit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in Depost Amount Craeted",
      success: false,
    });
  }
};
export const changeDepositAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        message: "Amount is required",
        success: false,
      });
    }

    const updatedDeposit = await DepositModel.findOneAndUpdate(
      {},
      { amount },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Deposit amount updated successfully",
      success: true,
      data: updatedDeposit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in Changing Deposit Amount",
      success: false,
      error: error.message,
    });
  }
};
export const createAgentPlan = async (req, res) => {
  try {
    const {
      agentName,
      durationInDays,
      incomePercent,
      minInvestment,
      maxInvestment,
      aiAgentFee,
      computingSkills
    } = req.body;

    if (
      !agentName ||
      !durationInDays ||
      !incomePercent ||
      !minInvestment ||
      !maxInvestment ||
      computingSkills === undefined
    ) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const plan = await AIAgentPlan.create({
      agentName,
      durationInDays,
      incomePercent,
      minInvestment,
      maxInvestment,
      aiAgentFee,
      computingSkills,
    });

    res.status(201).json({
      success: true,
      message: "AI Agent Plan created successfully.",
      data: plan,
    });
  } catch (error) {
    // console.error("Error creating AI Agent Plan:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
export const uploadBanner = async (req, res) => {
  try {
    const adminId = req.admin._id;
    if (!adminId) {
      return res.status(401).json({
        message: "Admin Access Required",
        success: false,
      });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        message: "Title are required",
        success: false,
      });
    }
    console.log(req.file)
    const file = req.file.path;
    if (!file) {
      return res.status(400).json({
        message: "Image is required",
        success: false,
      });
    }
    const fileurl = await cloudinary.uploader.upload(file)
    const banner = await Banner.create({
      title,
      imageUrl: fileurl.secure_url,
    });
    return res.status(200).json({
      message: "Banner Created",
      success: true,
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in Uploading Banner",
      success: false,
    });
  }
}
export const getAllBanners = async (req, res) => {
  try {
    const adminId = req.admin._id;
    if (!adminId) {
      return res.status(401).json({
        message: "Admin Access Required",
        success: false,
      });
    }

    const banners = await Banner.find({});
    console.log(banners)
    if (!banners) {
      return res.status(200).json({
        message: "No Banners Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Banners",
      data: banners,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const unblockUserLogin = async (req, res) => {
  try {
    const { userId } = req.body;


    if (!userId) {
      return res.status(400).json({
        message: "Username is required",
      });
    }



    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isLoginBlocked) {
      return res.status(400).json({
        message: "User is not blocked",
      });
    }



    user.isLoginBlocked = false;
    user.lastLoginDate = new Date();
    await user.save();

    return res.status(200).json({
      message: ` User ${user.username} unblocked successfully.`,
    });
  } catch (error) {
    // console.error("❌ Error unblocking user login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const deleteBanner = async (req, res) => {
  try {
    const adminId = req.admin._id;
    if (!adminId) {
      return res.status(401).json({
        message: "Admin Access Required",
        success: false,
      });
    }

    const bannerId = req.params.id;
    if (!bannerId) {
      return res.status(400).json({
        message: "Banner ID is required",
        success: false,
      });
    }

    // 🔎 Find banner to delete
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
        success: false,
      });
    }

    const publicId = banner.imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`foldername/${publicId}`);

    await Banner.findByIdAndDelete(bannerId);

    return res.status(200).json({
      message: "Banner deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error deleting banner",
      success: false,
    });
  }
};
// export const adminTopUp = async (req, res) => {
//   try {
//     const { userId, amount } = req.body;
//     console.log(req.body)

//     if (!userId || !amount) {
//       return res.status(400).json({ success: false, message: "Missing userId or amount" });
//     }

//     const user = await UserModel.findById(userId);
//     if (!user || !user.walletAddress) {
//       return res.status(404).json({ success: false, message: "User or wallet address not found" });
//     }
//     const result = await WithdrawalUsdt({ req, res, userId, walletAddress: user.walletAddress, amount });
//     if (result.status) {
//       user.isLoginBlocked = false;
//       await user.save();
//       return res.status(200).json({
//         success: true,
//         message: "USDT transferred and user unblocked",
//       });
//     }
//     else {
//       return res.status(500).json({
//         success: false,
//         message: "Withdrawal failed",
//       });
//     }

//   } catch (error) {
//     console.error("adminTopUp Error:", error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isLoginBlocked = true;
    await user.save();

    return res.status(200).json({ success: true, message: `User  ${user.username} blocked successfully ` });
  } catch (error) {
    console.error("blockUser Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const UnblockUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isLoginBlocked = false;
    await user.save();

    return res.status(200).json({ success: true, message: "User has been Unblocked" });
  } catch (error) {
    console.error("blockUser Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const toggleIsWithdrawalBlock = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isWithdrawalblock = !user.isWithdrawalblock;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User withdrawal has been ${user.isWithdrawalblock ? "blocked" : "unblocked"} successfully.`,
      iswithdrawalblock: user.isWithdrawalblock,
    });


  } catch (error) {
    console.error("toggleIsWithdrawalBlock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const adminTopUp = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: "Missing userId or amount" });
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be a valid number" });
    }

    const user = await UserModel.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ User Topup Update
    user.mainWallet += amountNumber;
    user.totalInvestment += amountNumber;
    user.principleAmount += amountNumber;
    user.currentEarnings += amountNumber;
    user.isVerified = true;
    user.status = true;
    user.activeDate = new Date();
    user.aiCredits += 4;
    user.isLoginBlocked = false;
    await user.save();

    await Investment.create({
      userId: user._id,
      investmentAmount: amountNumber,
      investmentDate: new Date(),
      txResponse: await generateRandomTxResponse(),
    });

    // ✅ Admin TopUp Record
    await AdminTopUp.create({
      userId: user._id,
      amount: amountNumber,
    });

    // ✅ Referral Income Logic
    if (user.sponsorId) {
      const parentUser = await UserModel.findById(user.sponsorId);
      const percentData = await DirectreferalPercentage.findOne();

      const percent = Number(percentData?.directReferralPercentage || 0);
      if (parentUser && percent > 0) {
        const referralBonus = (amountNumber * percent) / 100;

        parentUser.directReferalAmount += referralBonus;
        parentUser.mainWallet += referralBonus;
        parentUser.totalEarnings += referralBonus;
        parentUser.currentEarnings += referralBonus;
        parentUser.aiCredits += 1;
        await parentUser.save();

        await ReferalBonus.create({
          userId: parentUser._id,
          fromUser: user._id,
          amount: referralBonus,
          investmentId: null,
          date: new Date(),
        });
      }
    }

    return res.status(200).json({
      message: "User TopUp Successful and referral bonus Distributed",
      success: true,
    });

  } catch (error) {
    console.error("adminTopUp Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const adminTopUpHistory = async (req, res) => {
  try {
    const topups = await AdminTopUp.find()
      .populate({
        path: "userId",
        select: "username email name",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Admin top-up history fetched successfully",
      data: topups,
    });
  } catch (error) {
    console.error("adminTopUpHistory Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const incomeBlock = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isIncomeBlocked = !user.isIncomeBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User income is now ${user.isIncomeBlocked ? "blocked" : "unblocked"}`,
      isIncomeBlocked: user.isIncomeBlocked,
    });
  } catch (error) {
    console.error("IncomeBlock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { userId, name, email, phone } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in admin update:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
