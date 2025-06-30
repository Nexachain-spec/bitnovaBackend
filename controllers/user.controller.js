import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  generateReferralCode,
} from "../utils/Random.js";
import Investment from "../models/investment.model.js";
import ReferalBonus from "../models/referalBonus.js";
import DirectreferalPercentage from "../models/incomePercentage.model.js";
import { generateOTP, sendOTP } from "../utils/otp.js";
import Withdrawal from "../models/withdrawal.model.js";
import Commission from "../models/teamIncome.model.js";
import AnnoucementModel from "../models/Annoucement.model.js";
import DepositModel from "../models/deposit.model.js";
import FundTransfer from "../models/fundTransfer.model.js";
import { calculateTeams } from "../utils/calculateTeam.js";
import { generate2FA, verify2FA } from "../utils/2fa.js";
import nodemailer from "nodemailer";
import cloudinary from "../utils/cloudinary.js";
import AiAgentInvestment from "../models/AIAGENTINVESTMENT.model.js";
import AIAgentPlan from "../models/AIAgentPlan.model.js";
import Support from "../models/support.model.js";
import Banner from "../models/banner.model.js";
import { sendCredentials } from "../utils/sendCreditential.js";
import { sendInvestmentConfirmationEmail } from "../utils/sendInvestmentEmail.js";
import Roi from "../models/roi.model.js";
import { distributeCommissionsForAiAgent } from "../utils/distributeLevelIncomeUpto4Level.js";
import StakeModel from "../models/stake.model.js";




// const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

const findAvailablePosition = async (parentId) => {
  const queue = [parentId];

  while (queue.length > 0) {
    const currentUserId = queue.shift();
    const currentUser = await UserModel.findById(currentUserId);

    if (!currentUser) continue;
    if (!currentUser.left) {
      return { parent: currentUser._id, position: "left" };
    }
    queue.push(currentUser.left);

    if (!currentUser.right) {
      return { parent: currentUser._id, position: "right" };
    }
    queue.push(currentUser.right);
  }

  return null;
};

// const findAvailablePosition = async (parentId) => {
//   const queue = [parentId];

//   while (queue.length > 0) {
//     const currentUserId = queue.shift();
//     const currentUser = await UserModel.findById(currentUserId);

//     if (!currentUser) continue;

//     if (!currentUser.left) {
//       return { parent: currentUser._id, position: "left" };
//     } else {
//       queue.push(currentUser.left);
//     }

//     if (!currentUser.right) {
//       return { parent: currentUser._id, position: "right" };
//     } else {
//       queue.push(currentUser.right);
//     }
//   }

//   const fallbackUser = await UserModel.findOne({ role: "admin" }).sort({ createdAt: 1 });

//   if (!fallbackUser) {
//     throw new Error("No fallback admin user found for position allocation");
//   }

//   return { parent: fallbackUser._id, position: "left" };
// };


export const userRegisterWithEmail = async (req, res) => {
  try {
    const { name, email, password, referredBy, phone } = req.body;


    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const emails = email;
    const randomVal = await generateReferralCode()
    const referralCode = randomVal
    const username = randomVal
    const userCount = await UserModel.countDocuments();

    let role = "user";
    let parentId = null;
    let sponsorId = null;
    let side = null;

    const existingUser = await UserModel.findOne({ email: emails });

    if (existingUser) {
      if (existingUser.otpVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      const otp = generateOTP();
      await sendOTP(emails, otp, username);
      const hashedPassword = await bcrypt.hash(password, 10);

      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpire = Date.now() + 5 * 60 * 1000;
      existingUser.referralCode = referralCode;
      existingUser.username = username;
      existingUser.role = "user";
      existingUser.phone = phone;
      existingUser.otpVerified = false;
      existingUser.parentReferedCode = referredBy;
      existingUser.plainPassword = password

      if (userCount === 0) {
        existingUser.role = "admin";
      } else {
        if (!referredBy) {
          return res.status(400).json({
            success: false,
            message: "Referral ID is required for registration",
          });
        }



        const sponsorUser = await UserModel.findOne({
          referralCode: referredBy
        });
        if (!sponsorUser) {
          return res.status(400).json({
            success: false,
            message: "Invalid referral ID",
          });
        }

        sponsorId = sponsorUser._id;
        const placement = await findAvailablePosition(sponsorId);
        if (!placement) {
          return res.status(400).json({
            success: false,
            message: "No available position found",
          });
        }

        parentId = placement.parent;
        side = placement.position;

        existingUser.sponsorId = sponsorId;
        existingUser.parentId = parentId;
        existingUser.position = side;
      }

      await existingUser.save();

      if (sponsorId) {
        await UserModel.findByIdAndUpdate(sponsorId, {
          $addToSet: { referedUsers: existingUser._id },
        });
      }

      if (parentId) {
        await UserModel.findByIdAndUpdate(parentId, {
          [side]: existingUser._id,
        });
      }

      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      const updatedUser = await UserModel.findById(existingUser._id).populate({
        path: "referedUsers",
        match: { otpVerified: true },
        select: "-otp -password",
      });

      return res
        .cookie("token", token, {
          expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: false,
        })
        .status(200)
        .json({
          success: true,
          message: "OTP Sent Successfully",
          user: { data: updatedUser },
          token,
        });
    }

    if (userCount === 0) {
      role = "admin";
    } else {
      if (!referredBy) {
        return res.status(400).json({
          success: false,
          message: "Referral ID is required for registration",
        });
      }

      const sponsorUser = await UserModel.findOne({ referralCode: referredBy });
      if (!sponsorUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral ID",
        });
      }

      sponsorId = sponsorUser._id;
      const placement = await findAvailablePosition(sponsorId);
      if (!placement) {
        return res.status(400).json({
          success: false,
          message: "No available position found",
        });
      }

      parentId = placement.parent;
      side = placement.position;
    }

    const otp = generateOTP();

    await sendOTP(emails, otp, name);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username: username,
      name,
      email: emails,
      password: hashedPassword,
      referralCode,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000,
      sponsorId,
      parentId,
      role,
      username,
      phone,
      position: side,
      bonusAddedAt: Date.now(),
      parentReferedCode: referredBy,
      plainPassword: password

    });

    const savedUser = await newUser.save();


    if (sponsorId) {
      await UserModel.findByIdAndUpdate(sponsorId, {
        $push: { referedUsers: savedUser._id },
      });
    }

    if (parentId) {
      await UserModel.findByIdAndUpdate(parentId, {
        [side]: savedUser._id,
      });
    }

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const user = await UserModel.findById(savedUser._id).populate({
      path: "referedUsers",
      match: { otpVerified: true },
      select: "-otp -password",
    });

    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
      })
      .status(201)
      .json({
        success: true,
        message: "OTP Sent Successfully",
        data: user,
        token,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// export const verifyOTP = async (req, res) => {
//   try {

//     let { email, otp } = req.body;

//     email = email.toLowerCase();

//     if (!email || !otp) {
//       return res.status(400).json({ message: "Email and OTP are required" });
//     }

//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }


//     const otpExpiryTime = user.otpExpire;
//     if (new Date() > new Date(otpExpiryTime)) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     await sendCredentials(user.email, user.name, user.plainPassword);

//     user.isVerified = true;
//     user.otpVerified = true;
//     user.otp = null;
//     // user.plainPassword = null
//     user.otpExpire = null;
//     await user.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     return res
//       .cookie("token", token, {
//         expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//         secure: false,
//         sameSite: "none",
//       })
//       .status(200)
//       .json({ message: "OTP verified successfully", token });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

export const verifyOTP = async (req, res) => {
  try {

    let { email, otp } = req.body;
    email = email.toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpire || new Date() > new Date(user.otpExpire)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const rawPassword = user.plainPassword;
    if (!rawPassword) {
      return res.status(400).json({ message: "Password not found" });
    }

    await sendCredentials(user.email, user.name, rawPassword);

    const encodedPassword = jwt.sign({ password: rawPassword }, process.env.JWT_SECRET);

    user.isVerified = true;
    user.otpVerified = true;
    user.otp = null;
    user.otpExpire = null;
    user.plainPassword = encodedPassword;

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res
      .cookie("token", token, {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error("❌ OTP Verify Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
   
    const user = await UserModel.findOne({ email }).populate("referedUsers");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not Found",
      });
    }
    if (user.isLoginBlocked) {
      return res.status(401).json({
        success: false,
        message: "You haven’t logged in for the past 4 days, so your account has been temporarily blocked. Please raise a support ticket to regain access."

      });
    }

    if (!user.isVerified) {
      return res.status(404).json({
        message: "You are not registered",
        success: false
      })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
        sameSite: "none",
      })
      .status(200)
      .json({
        success: true,
        token,
        data: user,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { username, phone, name } = req.body;
    const newUser = await UserModel.findByIdAndUpdate(
      user._id,
      { username: username, phone, name },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

export const initialInvestment = async (req, res) => {
  try {
    const { investmentAmount, txResponse, walletAddress } = req.body;
    const userId = req.user?._id;

    if (!userId || investmentAmount == null || !txResponse || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingInvestment = await Investment.findOne({ txResponse });
    if (existingInvestment) {
      return res.status(409).json({
        success: false,
        message: "This transaction has already been processed",
        investment: existingInvestment,
      });
    }

    const currentDate = new Date();

    const investment = await Investment.create({
      userId,
      investmentAmount: Number(investmentAmount),
      walletAddress,
      txResponse,
      investmentDate: currentDate,
    });

    const level = user.level;

    const depositConfig = await DepositModel.findOne();
    if (!depositConfig) {
      return res.status(500).json({
        success: false,
        message: "Deposit configuration not found",
      });
    }
    const configAmount = depositConfig ? Number(depositConfig.amount) : 0;
    const amount = Number(investmentAmount);
    if (level === 0 || level === 1) {
      const firstWallet = amount > configAmount ? configAmount : amount;
      const secondWallet = amount > configAmount ? (amount - configAmount) : 0;

      user.mainWallet += firstWallet;
      user.additionalWallet += secondWallet;
    } else {
      user.mainWallet += amount;
      user.currentEarnings += amount;
    }



    user.principleAmount += amount;
    user.totalInvestment += amount;
    user.investments.push(investment._id);
    user.isVerified = true;
    user.status = true; git
    user.activeDate = currentDate;
    user.aiCredits += 4;
    user.walletAddress = walletAddress;

    await user.save();
    await sendInvestmentConfirmationEmail(
      user.email,
      user.name,
      amount,
      investment.investmentDate
    );


    if (user.sponsorId) {
      const parentUser = await UserModel.findById(user.sponsorId);
      const percentData = await DirectreferalPercentage.findOne();

      if (!percentData) {
        return res.status(500).json({
          success: false,
          message: "Referral percentage configuration not found",
        });
      }

      const percent = Number(percentData.directReferralPercentage);

      if (parentUser && !isNaN(percent)) {
        const referralBonus = (amount * percent) / 100;

        parentUser.directReferalAmount += referralBonus;
        parentUser.totalEarnings += referralBonus;
        parentUser.currentEarnings += referralBonus;
        parentUser.mainWallet += referralBonus;
        parentUser.aiCredits += 1;

        await parentUser.save();

        await ReferalBonus.create({
          userId: parentUser._id,
          fromUser: user._id,
          amount: referralBonus,
          investmentId: investment._id,
          date: currentDate,
        });
      } else {
        // console.warn("Parent user not found or invalid referral percent.");
      }
    }

    return res.status(201).json({
      success: true,
      message: "Investment successful",
      investment,
    });

  } catch (error) {
    // console.error("Error in initialInvestment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const investment = async (req, res) => {
  try {
    const { investmentAmount, txResponse, walletAddress } = req.body;
    const userId = req.user._id;

    if (!userId || !investmentAmount || !txResponse || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (investmentAmount >= 30) {
      return res.status(400).json({
        success: false,
        message: "Minimum investment is $30",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingInvestment = await Investment.findOne({ txResponse });
    if (existingInvestment) {
      return res.status(409).json({
        success: false,
        message: "This transaction has already been processed",
        investment: existingInvestment,
      });
    }

    const investment = await Investment.create({
      userId,
      investmentAmount,
      txResponse,
      investmentDate: new Date(),
    });

    user.investments.push(investment._id);

    user.totalInvestment += Number(investmentAmount);
    user.currentEarnings += Number(investmentAmount)
    user.isVerified = true;
    user.principleAmount += Number(investmentAmount)
    user.status = true;
    user.activeDate = new Date();
    user.aiCredits += 4;
    user.walletAddress = walletAddress;
    await user.save();
    await sendInvestmentConfirmationEmail(
      user.email,
      user.name,
      investmentAmount,
      investment.investmentDate
    );

    if (user.sponsorId) {
      const parentUser = await UserModel.findById(user.sponsorId);
      const percentData = await DirectreferalPercentage.findOne();

      if (!percentData) {
        // console.warn("No DirectreferalPercentage document found.");
      } else {
        // console.log("Direct referral percentage data:", percentData);
      }

      const percent = Number(percentData?.directReferralPercentage);
      if (parentUser && !parentUser.isIncomeBlocked && !isNaN(percent)) {
        // console.log(`Referral percent: ${percent}%`);
        const referralBonus = (investmentAmount * percent) / 100;
        // console.log(`Calculated referral bonus: $${referralBonus}`);
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
          investmentId: investment._id,
          date: new Date(),
        });
      } else {
        // console.warn("Parent user not found or referral percent is invalid.");
      }
    }

    return res.status(201).json({
      success: true,
      message: "Investment successful",
      investment,
    });
  } catch (error) {
    // console.error("Error in Investment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const userLogout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
      return res.status(400).json({ success: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    await BlacklistToken.create({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });

    res.clearCookie("token").status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed", error: error.message });
  }
};
const getAllDownlines = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) return [];

  let downlines = [];

  if (user.left) {
    downlines.push(user.left);
    downlines = downlines.concat(await getAllDownlines(user.left));
  }

  if (user.right) {
    downlines.push(user.right);
    downlines = downlines.concat(await getAllDownlines(user.right));
  }

  return downlines;
};
export const getDownLines = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authorized",
      });
    }

    const downlineIds = await getAllDownlines(userId);

    const downlineUsers = await UserModel.find({
      _id: { $in: downlineIds },
    }).select("username");

    res.status(200).json({
      success: true,
      total: downlineUsers.length,
      data: downlineUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getUsersCountByLevel = async (req, res) => {
  try {
    const userId = req.user._id;

    let levelCounts = [];
    let currentLevelUsers = [userId];
    const visited = new Set();

    for (let level = 1; level <= 10; level++) {
      const users = await UserModel.find(
        { _id: { $in: currentLevelUsers } },
        { referedUsers: 1 }
      );

      let nextLevelUserIds = [];

      users.forEach((user) => {
        if (user.referedUsers && user.referedUsers.length > 0) {
          user.referedUsers.forEach((refId) => {
            const idStr = refId.toString();
            if (!visited.has(idStr)) {
              visited.add(idStr);
              nextLevelUserIds.push(refId);
            }
          });
        }
      });

      const nextLevelUsers = await UserModel.find(
        { _id: { $in: nextLevelUserIds } },
        {
          username: 1,
          referralCode: 1,
          walletAddress: 1,
          totalInvestment: 1,
        }
      );

      levelCounts.push({
        level,
        count: nextLevelUsers.length,
        users: nextLevelUsers,
      });

      currentLevelUsers = nextLevelUserIds;
    }

    res.status(200).json({
      success: true,
      data: levelCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const userProfile = await UserModel.findById(userId).populate(
      "referedUsers"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: userProfile });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getAllWithdrawalsRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const withdrawals = await Withdrawal.find({ userId }).populate("userId");
    res.status(200).json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const withdrawalRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { amount, userWalletAddress } = req.body;
    if (!amount || !userWalletAddress) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    if (user.currentEarnings < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        success: false,
      });
    }

    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      userWalletAddress,
      status: "pending",
    });
    await withdrawal.save();
    user.currentEarnings -= Number(amount);
    user.totalWithdrawals += Number(amount);
    user.save();
    res.status(200).json({
      success: true,
      message: "Withdrawal request sent successfully",
      data: withdrawal,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const withdrawal = await Withdrawal.findById(id).populate("userId");
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Withdrawal already processed",
      });
    }

    withdrawal.status = "success";
    withdrawal.adminNote = message || "Approved by admin";
    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal approved successfully",
      data: withdrawal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const withdrawal = await Withdrawal.findById(id).populate("userId");
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Withdrawal already processed",
      });
    }

    withdrawal.status = "rejected";
    withdrawal.adminNote = message || "Rejected by admin";
    await withdrawal.save();

    // Return user's money back
    const user = await UserModel.findById(withdrawal.userId._id);
    user.currentEarnings += withdrawal.amount;
    user.totalWithdrawals -= withdrawal.amount;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal rejected successfully",
      data: withdrawal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const changeWalletAddress = async (req, res) => {
  try {
    const { walletAddress, password, otp } = req.body;
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "User not Found",
        success: true,
      });
    }

    if (!walletAddress || !password || !otp) {
      return res.status(400).json({
        error: "All fields (walletAddress, password, otp) are required",
      });
    }
    const user = await UserModel.findOne({ userId });
    if (!user) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const isOtpValid = verifyOTP(user, otp);
    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.walletAddress = walletAddress;
    user.otp = null;
    user.otpExpire = null;
    user.withdrawalBlockedUntil = new Date(Date.now() + 72 * 60 * 60 * 1000);
    await user.save();

    res.status(200).json({ message: "Wallet address changed successfully" });
  } catch (error) {
    // console.error(error);

    res
      .status(500)
      .json({ error: "An error occurred while changing the wallet address" });
  }
};

export const sendOTPForChangeAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const email = user.email;
    if (!email) {
      return res.status(400).json({
        message: "Email not found for the user",
        success: false,
      });
    }

    const otp = generateOTP();
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 5);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    const emailSent = await sendOTP(email, otp, user.username);
    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send OTP to email",
        success: false,
      });
    }

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: error.message || "Sending OTP Error",
      success: false,
    });
  }
};

export const getAllReferralHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "User is Unauthorized",
        success: false,
      });
    }
    const allHistory = await ReferalBonus.find({ userId });
    if (!allHistory || allHistory.length === 0) {
      return res.status(200).json({
        message: "No Referral History Found",
        success: true,
      });
    }
    return res.status(200).json({
      message: "Referral History Fetched Successfully",
      success: true,
      data: allHistory,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Referral History Getting Errors",
    });
  }
};

export const getAllLevelIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "User is Unauthorized",
        success: false,
      });
    }

    const allLevelHistory = await Commission.find({ userId });

    if (!allLevelHistory || allLevelHistory.length === 0) {
      return res.status(404).json({
        message: "No income history found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Income history fetched successfully",
      success: true,
      data: allLevelHistory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

export const getAllHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "User Unautorized",
        success: false,
      });
    }
    const referralHistory = await ReferalBonus.find({ userId });
    const LevelIncomeHistory = await Commission.find({ userId });
    if (!LevelIncomeHistory || LevelIncomeHistory.length === 0) {
      return res.status(200).json({
        message: "No Level History Found",
        success: true,
      });
    }
    if (!referralHistory || referralHistory.length === 0) {
      return res.status(200).json({
        message: "Referral History Not Found",
        success: true,
      });
    }
    const data = [...referralHistory, ...LevelIncomeHistory];
    return res.status(200).json({
      message: "All History Fetched SuccessFully",
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in Getting All History",
      success: false,
    });
  }
};

export const getAllAnoucement = async (req, res) => {
  try {
    const allAnnoucement = await AnnoucementModel.find({});
    if (!allAnnoucement || !allAnnoucement.length === 0) {
      return res.status(200).json({
        message: "No Announced exists",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Annoucement Fetched Successfully",
      success: false,
      data: allAnnoucement,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in Getting Announcement Fetching",
      success: false,
    });
  }
};

export const generate2FAHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = await UserModel.findOne({ email })

    if (user.twoFASecret) {
      return res.status(400).json({
        message: "2FA is already enabled for this user",
        success: false,
      });
    }

    const { secret, qrCode } = await generate2FA(email);

    return res.status(200).json({ secret, qrCode, success: true });
  } catch (error) {
    // console.error("2FA Generation Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verify2FAHandler = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res
        .status(400)
        .json({ error: "OTP and Email are required", success: false });
    }

    const verified = await verify2FA(email, otp);

    if (verified) {
      return res.status(200).json({ verified: true, success: true });
    } else {
      return res
        .status(401)
        .json({ verified: false, success: false, error: "Invalid OTP" });
    }
  } catch (error) {
    // console.error("2FA Verification Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", success: false });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { otp, password } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const existingUser = await UserModel.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User Not Found",
        success: false,
      });
    }

    if (!otp || !password) {
      return res.status(400).json({
        message: "All Fields are Required",
        success: false,
      });
    }

    const verify = await verifyOTP(otp, existingUser.username);

    if (!verify) {
      return res.status(400).json({
        message: "Invalid or Expired OTP",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;

    const blockTime = new Date(Date.now() + 72 * 60 * 60 * 1000);
    existingUser.withdrawalBlockedUntil = blockTime;

    await existingUser.save();

    return res.status(200).json({
      message: "Password changed successfully. Withdrawal blocked for 72 hours.",
      success: true,
    });

  } catch (error) {
    // console.error("Change Password Error:", error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

export const swapAmount = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    let { amount, walletType } = req.body;

    if (!amount || !walletType) {
      return res.status(400).json({
        message: "Amount and walletType are required",
        success: false,
      });
    }

    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
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

    if (Number(user.level) <= 0) {
      return res.status(400).json({
        message: "You are not eligible to swap amount",
        success: false,
      });
    }

    let fromWallet, toWallet, fromLabel, toLabel;

    if (walletType === "additional-to-main") {
      fromWallet = "additionalWallet";
      toWallet = "mainWallet";
      fromLabel = "Additional Wallet";
      toLabel = "Main Wallet";
    } else if (walletType === "main-to-additional") {
      fromWallet = "mainWallet";
      toWallet = "additionalWallet";
      fromLabel = "Main Wallet";
      toLabel = "Additional Wallet";
    } else {
      return res.status(400).json({
        message: "Invalid walletType",
        success: false,
      });
    }

    const fromBalance = Number(user[fromWallet]);
    const toBalance = Number(user[toWallet]);

    if (fromBalance < amount) {
      return res.status(400).json({
        message: `Insufficient balance in ${fromLabel}`,
        success: false,
      });
    }

    // Perform the swap with Number()
    user[fromWallet] = fromBalance - amount;
    user[toWallet] = toBalance + amount;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `₹${amount} swapped successfully from ${fromLabel} to ${toLabel}`,
      mainWallet: Number(user.mainWallet),
      additionalWallet: Number(user.additionalWallet),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const allIncomes = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(401).json({
      message: "User not Authorized",
      success: false
    });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const levelIncome = await Commission.find({ userId });
    const withdrawalIncome = await Withdrawal.find({ userId });
    const directReferralIncome = await ReferalBonus.find({ userId });

    const totalIncome =
      levelIncome.reduce((sum, income) => sum + income.amount, 0) +
      withdrawalIncome.reduce((sum, income) => sum + income.amount, 0) +
      directReferralIncome.reduce((sum, income) => sum + income.amount, 0);

    const todayLevelIncome = levelIncome
      .filter(income => new Date(income.date).setHours(0, 0, 0, 0) === today.getTime())
      .reduce((sum, income) => sum + income.amount, 0);

    const todayWithdrawalIncome = withdrawalIncome
      .filter(income => new Date(income.date).setHours(0, 0, 0, 0) === today.getTime())
      .reduce((sum, income) => sum + income.amount, 0);

    const todayDirectReferralIncome = directReferralIncome
      .filter(income => new Date(income.date).setHours(0, 0, 0, 0) === today.getTime())
      .reduce((sum, income) => sum + income.amount, 0);

    const todayTotalIncome = todayLevelIncome + todayWithdrawalIncome + todayDirectReferralIncome;

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        todayTotalIncome,
        todayLevelIncome,
        todayWithdrawalIncome,
        todayDirectReferralIncome,
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching income data",
      success: false,
      error: error.message
    });
  }
};

export const withdrawalHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User is unauthorized",
        success: false
      });
    }

    const history = await Withdrawal.find({ userId });

    if (history.length === 0) {
      return res.status(200).json({
        message: "No history found",
        success: false,
        data: []
      });
    }

    return res.status(200).json({
      message: "Withdraw history fetched successfully",
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in fetching withdrawal history",
      success: false
    });
  }
};

export const depositHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User is unauthorized",
        success: false
      });
    }

    const history = await Investment.find({ userId }).populate("userId", "username");

    if (history.length === 0) {
      return res.status(200).json({
        message: "No history found",
        success: false,
        data: []
      });
    }

    return res.status(200).json({
      message: "Deposit history fetched successfully",
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in fetching withdrawal history",
      success: false
    });
  }
};

export const LevelIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User is unauthorized",
        success: false
      });
    }

    const history = await Commission.find({ userId }).populate("userId", "username").populate("fromUserId", "username");

    if (history.length === 0) {
      return res.status(200).json({
        message: "No history found",
        success: false,
        data: []
      });
    }

    return res.status(200).json({
      message: "LevelIncome history fetched successfully",
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in fetching LevelIncome history",
      success: false
    });
  }
};

export const ReferralIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User is unauthorized",
        success: false
      });
    }

    const history = await ReferalBonus.find({ userId }).populate("userId", "username").populate("fromUser", "username").populate("investmentId", "investmentAmount");
    if (history.length === 0) {
      return res.status(200).json({
        message: "No history found",
        success: false,
        data: []
      });
    }

    return res.status(200).json({
      message: "Referral history fetched successfully",
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in Referral history",
      success: false
    });
  }
};

export const getAllFundTransferHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false
      });
    }

    const history = await FundTransfer.find({ from: userId }).populate("to", "username");

    if (history.length === 0) {
      return res.status(200).json({
        message: "No fund transfer history found",
        success: true,
        data: []
      });
    }

    return res.status(200).json({
      message: "Fund history fetched successfully",
      success: true,
      data: history
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in getting fund transfer history",
      success: false
    });
  }
};

export const sendOtpForPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found for this email",
        success: false,
      });
    }

    const otp = generateOTP();
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 5);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    await sendOTP(user.email, otp, user.username);
    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: error.message || "Sending OTP Error",
      success: false,
    });
  }
};

export const verifyOtpForPassword = async (req, res) => {
  try {
    const { otp, email, password } = req.body;

    if (!otp || !email || !password) {
      return res.status(400).json({
        message: "OTP & Email are required",
        success: false
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found for this email",
        success: false
      });
    }



    if (!user.otp || !user.otpExpire || new Date() > user.otpExpire) {
      return res.status(400).json({
        message: "OTP expired or not valid",
        success: false
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        success: false
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully and Password reset Successfully",
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error verifying OTP",
      success: false
    });
  }
};

// export const getMemeberAndTeamData = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     if (!userId) {
//       return res.status(400).json({
//         message: "User not Authorized",
//         success: false
//       });
//     }
//     const allUsers = await UserModel.find({ sponsorId: userId });

//     if (!allUsers || !allUsers.length) {
//       return res.status(200).json({
//         message: "No Team Found for this user",
//         success: false
//       });
//     }

//     const { teamA, teamB, teamC, totalTeamBC } = await calculateTeams(userId);

//     return res.status(200).json({
//       message: "Team Data fetched successfully",
//       success: true,
//       data: {
//         teamA: teamA.length,
//         teamB: teamB.length,
//         teamC: teamC.length,
//         totalTeamBC,
//         totalTeam: teamA.length + teamB.length + teamC.length,
//         teamAMembers: teamA,
//         teamBMembers: teamB,
//         teamCMembers: teamC,
//       }
//     });

//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || "Getting Error in getMember Data",
//       success: false
//     });
//   }
// };

export const getMemeberAndTeamData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User not Authorized",
        success: false
      });
    }
    console.log(userId)

    const allUsers = await UserModel.find({ sponsorId: userId });
    console.log(allUsers)
    if (!allUsers || !allUsers.length) {
      return res.status(200).json({
        message: "No Team Found for this user",
        success: false
      });
    }

    const { teamA, teamB, teamC, teamD, totalTeamBCD } = await calculateTeams(userId, date);
    const totalInvestment = (team) => {
      return team.reduce((acc, member) => acc + (member.totalInvestment || 0), 0);
    };

    const totalInvestmentA = totalInvestment(teamA);
    const totalInvestmentB = totalInvestment(teamB);
    const totalInvestmentC = totalInvestment(teamC);
    const totalInvestmentD = totalInvestment(teamD);

    return res.status(200).json({
      message: "Team Data fetched successfully",
      success: true,
      data: {
        teamA: teamA.length,
        teamB: teamB.length,
        teamC: teamC.length,
        teamD: teamD.length,
        totalTeamBCD,
        totalTeam: teamA.length + teamB.length + teamC.length + teamD.length,
        teamAMembers: teamA,
        teamBMembers: teamB,
        teamCMembers: teamC,
        totalInvestmentA,
        totalInvestmentB,
        totalInvestmentC,
        totalInvestmentD,
        totalInvestmentAll: totalInvestmentA + totalInvestmentB + totalInvestmentC + totalInvestmentD,
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Getting Error in getMember Data",
      success: false
    });
  }
};

export const sendOtpForMoneyTransfer = async (req, res) => {
  try {
    const userId = req.user._id

    const user = await UserModel.findById(userId)

    if (!user) {
      return res.status(400).json({
        message: "User not Found",
        success: false,
      });
    }




    const username = user.username;
    const email = user.email

    const otp = Math.floor(100000 + Math.random() * 900000);

    await sendOTP(email, otp, username);

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });

  } catch (error) {
    // console.error("Error sending OTP:", error);
    return res.status(500).json({
      message: "Something went wrong while sending OTP",
      success: false,
      error: error.message,
    });
  }
};

export const transferAmountToAnotherUser = async (req, res) => {
  try {
    const transferUserId = req.user._id;
    console.log(transferUserId, "transfer")

    if (!transferUserId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const { amount, username, otp } = req.body;

    if (!amount || !username || !otp) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    const sender = await UserModel.findById(transferUserId);
    if (sender.totalTradeCount < 5) {
      return res.status(400).json({
        message: "You need to complete 5 trades before transferring funds",
        success: false,
      });
    }

    if (!sender) {
      return res.status(404).json({
        message: "Sender not found",
        success: false,
      });
    }

    if (
      sender.otp !== otp ||
      !sender.otpExpire ||
      sender.otpExpire < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }

    const receiver = await UserModel.findOne({ referralCode: username });
    if (!receiver) {
      return res.status(404).json({
        message: "Receiver user not found",
        success: false,
      });
    }

    if (sender.mainWallet < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        success: false,
      });
    }

    sender.mainWallet -= amount;
    receiver.mainWallet += amount;

    sender.otp = null;
    sender.otpExpire = null;

    await sender.save();
    await receiver.save();

    await FundTransfer.create({
      amount,
      to: receiver._id,
      from: sender._id,
    });

    await Investment.create({
      userId: receiver._id,
      investmentAmount: amount,
      investmentDate: Date.now(),
    })

    return res.status(200).json({
      message: "Amount transferred successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in transferring amount",
      success: false,
    });
  }
};

export const sendInvitation = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Email and name are required." });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    7
    const mailOptions = {
      from: `"1Trade" <${process.env.EMAIL}>`,
      to: email,
      subject: "🎉 You're Invited to Join Our Platform!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #333;">Hey ${name},</h2>
            <p style="font-size: 16px;">You've been invited to join our platform! Click the button below to get started:</p>
            <a href="https://www.youtube.com" style="display: inline-block; padding: 12px 24px; margin-top: 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
            <p style="margin-top: 20px; font-size: 14px; color: #777;">If you did not expect this email, you can safely ignore it.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `Invitation sent successfully to ${email}`,
    });

  } catch (error) {
    // console.error("Error sending invitation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send invitation.",
      error: error.message,
    });
  }
};

export const reset2FAHandler = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { secret, qrCode } = await generate2FA(user.email, true);

    return res.status(200).json({
      success: true,
      message: "2FA reset successfully. Scan QR code again.",
      qrCode,
      secret,
    });
  } catch (error) {
    // console.error("Reset 2FA Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const supportMessage = async (req, res) => {
  try {
    const { subject, message, description } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject and message are required." });
    }

    const imageUrl = req.file?.path || "";
    const image = await cloudinary.uploader.upload(imageUrl)


    const newSupport = await Support.create({
      userId: req.user._id,
      subject,
      message,
      description: description || "",
      file: image.secure_url
    });

    res.status(201).json({
      success: true,
      message: "Support message submitted successfully.",
      data: newSupport
    });

  } catch (error) {
    // console.error("Error in supportMessage:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

export const getAllSuppoertMessages = async (req, res) => {
  try {
    const userId = req.user._id
    if (!userId) {
      return res.status(401).json({
        message: "User not Authenticated"
      })
    }
    const history = await Support.find({ userId })
    if (!history || history.length === 0) {
      return res.status(200).json({
        message: "History not found",
        success: false
      })
    }
    return res.status(200).json({
      message: "History fetched successfully",
      success: true,
      data: history
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error in getting Support Messages",
      success: false
    })

  }
}

// export const AiAgentInvestInPlan = async (req, res) => {
//   try {
//     const { userId, planId, investedAmount } = req.body;
//     if (!userId) {
//       return res.status(401).json({
//         message: "Unauthorized",
//         success: false
//       });
//     }
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false
//       });
//     }

//     const plan = await AIAgentPlan.findById(planId);
//     if (!plan) {
//       return res.status(404).json({ message: "Plan not found" });
//     }

//     if (investedAmount < plan.minInvestment || investedAmount > plan.maxInvestment) {
//       return res.status(400).json({
//         message: `Investment must be between ${plan.minInvestment} and ${plan.maxInvestment}`
//       });
//     }

//     const expectedReturn = investedAmount + (investedAmount * plan.incomePercent / 100) * (plan.durationInDays / 30);

//     const maturityDate = new Date();
//     maturityDate.setDate(maturityDate.getDate() + plan.durationInDays);

//     const newInvestment = await AiAgentInvestment.create({
//       userId,
//       plan: planId,
//       investedAmount,
//       expectedReturn,
//       maturityDate
//     });
//     await distributeCommissionsForAiAgent(user, investedAmount)
//     console.log("done")

//     res.status(201).json({
//       success: true,
//       message: "Investment successful",
//       data: newInvestment
//     });

//   } catch (error) {
//     // console.error("Investment Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const setWalletAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false
      });
    }
    const { walletAddress } = req.body;



    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }


    user.walletAddress = walletAddress;
    await user.save();

    return res.status(200).json({
      message: "Wallet address connected successfully",
      success: true,
    });

  } catch (error) {
    // console.error("Error updating wallet address:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

export const sendOTPForBep20Address = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const email = user.email;
    if (!email) {
      return res.status(400).json({
        message: "Email not found for the user",
        success: false,
      });
    }

    const otp = generateOTP();
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 5);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    await sendOTP(email, otp, user.username);

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: error.message || "Sending OTP Error",
      success: false,
    });
  }
};

export const verifyOTPForWallet = async (email, otp) => {
  try {
    if (!email || !otp) {
      return { success: false, message: "Email and OTP are required" };
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.otp !== otp) {
      return { success: false, message: "Invalid OTP" };
    }

    const otpExpiryTime = user.otpExpire;
    if (new Date() > new Date(otpExpiryTime)) {
      return { success: false, message: "OTP has expired" };
    }

    // OTP is valid — mark as verified and clear
    user.otpVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    return { success: true, message: "OTP verified successfully" };

  } catch (error) {
    // console.error("verifyOTPForWallet error:", error);
    return { success: false, message: "Internal Server Error" };
  }
};

export const setBep20 = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailCode, loginPassword, authOtp, walletAddress } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "BEP-20 wallet address is required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isOtpValid = await verifyOTPForWallet(user.email, emailCode);
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email verification code",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(loginPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Incorrect login password",
      });
    }

    const is2FAValid = verify2FA(user.email, authOtp);
    if (!is2FAValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid 2FA code",
      });
    }

    user.bep20Address = walletAddress;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "BEP-20 wallet address changed successfully",
      bep20Address: user.bep20Address,
    });

  } catch (error) {
    // console.error("Error setting BEP-20 address:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const setTrc20 = async (req, res) => {
  try {
    const userId = req.user._id;
    const { emailCode, loginPassword, authOtp, walletAddress } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "TRC-20 wallet address is required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isOtpValid = await verifyOTPForWallet(user.email, emailCode);
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email verification code",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(loginPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Incorrect login password",
      });
    }

    const is2FAValid = verify2FA(user.email, authOtp);
    if (!is2FAValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid 2FA code",
      });
    }

    user.trc20Address = walletAddress;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "TRC-20 wallet address changed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllAiPlans = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const allPlans = await AIAgentPlan.find({});

    return res.status(200).json({
      message: "All AI Plans fetched successfully",
      success: true,
      plans: allPlans,
    });

  } catch (error) {
    // console.error("Error in getAllAiPlans:", error.message);
    return res.status(500).json({
      message: "Error in getting AI trade plans",
      success: false,
    });
  }
};

export const getAllAiPlansById = async (req, res) => {
  try {
    const userId = req.user._id;
    const planId = req.params.id;
    if (!planId) {
      return res.status(400).json({
        message: "Plan ID is required",
        success: false,
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const allPlans = await AIAgentPlan.findById(planId);

    return res.status(200).json({
      message: "AI Plan fetched successfully",
      success: true,
      plans: allPlans,
    });

  } catch (error) {
    // console.error("Error in getAllAiPlans:", error.message);
    return res.status(500).json({
      message: "Error in getting AI trade plans",
      success: false,
    });
  }
}

export const aiAgentInvestment = async (req, res) => {
  try {
    const userId = req.user._id;
    let { planId, investmentAmount } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    if (!planId || !investmentAmount) {
      return res.status(400).json({
        message: "Plan ID and investment amount are required",
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

    const investedAmount = parseFloat(investmentAmount);
    if (isNaN(investedAmount) || investedAmount <= 0) {
      return res.status(400).json({
        message: "Invalid investment amount",
        success: false,
      });
    }



    if (user.additionalWallet < investedAmount) {
      return res.status(400).json({
        message: "Insufficient balance in additional wallet",
        success: false,
      });
    }

    const plan = await AIAgentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
        success: false,
      });
    }

    if (investedAmount < plan.minInvestment || investedAmount > plan.maxInvestment) {
      return res.status(400).json({
        message: `Investment amount must be between ${plan.minInvestment} and ${plan.maxInvestment}`,
        success: false,
      });
    }

    if (!plan.durationInDays || plan.durationInDays <= 0) {
      return res.status(400).json({
        message: "Invalid plan duration",
        success: false,
      });
    }

    user.additionalWallet -= investedAmount;
    await user.save();

    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + plan.durationInDays);
    const expectedReturn = investedAmount + (investedAmount * plan.incomePercent / 100 * plan.durationInDays);

    const newInvestment = await AiAgentInvestment.create({
      userId,
      plan: planId,
      investedAmount,
      maturityDate,
      expectedReturn,
    });
    await distributeCommissionsForAiAgent(user, investedAmount)


    return res.status(201).json({
      message: "Investment successful",
      success: true,
      investment: newInvestment,
    });


  } catch (error) {
    // console.error("Error in aiAgentInvestment:", error);
    return res.status(500).json({
      message: "Something went wrong while making investment",
      success: false,
      error: error.message,
    });
  }
};

export const getAiAgentInvestmentsForActive = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const plans = await AiAgentInvestment.find({ userId })
    if (plans.length === 0) {
      return res.status(404).json({
        message: "No AI agent investments found for this user",
        success: false,
      });
    }
    return res.status(200).json({
      message: "AI agent investments fetched successfully",
      success: true,
      data: plans
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching AI agent investments",
      success: false,
      error: error.message,
    });

  }
}
export const getTeamCount = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
    });
  }
  try {
    const { teamA, teamB, teamC, totalTeamBC } = await calculateTeams(userId);

    return res.status(200).json({
      message: "Team count fetched successfully",
      success: true,
      data: {
        teamA: teamA.length,
        teamB: teamB.length,
        teamC: teamC.length,
        totalTeamBC,
        totalTeam: teamA.length + teamB.length + teamC.length,
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error fetching team count",
      success: false,
    });
  }
}
export const transferAiAgentToMainWallet = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const aiTotalAmount = user.aiAgentTotal;
    if (aiTotalAmount <= 0) {
      return res.status(400).json({ message: "You have already redeemed your amount", success: false });
    }

    const deduction = aiTotalAmount * 0.05;
    const amountToTransfer = aiTotalAmount - deduction;

    user.mainWallet += amountToTransfer;
    user.aiAgentTotal = 0;
    user.aiAgentInvestment -= aiTotalAmount;
    await user.save();

    await AiAgentInvestment.updateMany(
      { userId, isMatured: true, isRedeemed: false },
      { $set: { isRedeemed: true, isActive: false } }
    );

    return res.status(200).json({
      message: `Amount $${amountToTransfer} transferred to main wallet after 5% deduction ($${deduction}).`,
      success: true,
      transferredAmount: amountToTransfer,
      deducted: deduction,
    });
  } catch (error) {
    console.error("Transfer Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
export const getAiAgentInvestHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const investments = await AiAgentInvestment.find({ userId }).populate("plan", "planName incomePercent durationInDays minInvestment maxInvestment");
    if (!investments || investments.length === 0) {
      return res.status(404).json({
        message: "No AI agent investment history found for this user",
        success: false,
        data: []
      });
    }
    if (investments.length === 0) {
      return res.status(200).json({
        message: "No AI agent investment history found",
        success: false,
        data: []
      });
    }

    return res.status(200).json({
      message: "AI agent investment history fetched successfully",
      success: true,
      data: investments
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error fetching AI agent investment history",
      success: false
    });
  }
}
export const getAllBanners = async (req, res) => {
  try {
    const adminId = req.user._id;
    if (!adminId) {
      return res.status(401).json({
        message: "Admin Access Required",
        success: false,
      });
    }

    const banners = await Banner.find({});
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
export const sendOTPForWithdrwal = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const email = user.email;
    if (!email) {
      return res.status(400).json({
        message: "Email not found for the user",
        success: false,
      });
    }

    const otp = generateOTP();
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 5);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    await sendOTP(email, otp, user.username);

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: error.message || "Sending OTP Error",
      success: false,
    });
  }
};
export const getAllTradeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false
      });
    }

    // Get all ROI entries for this user
    const history = await Roi.find({ userId }).sort({ createdAt: -1 }); // Optional: newest first

    if (!history || history.length === 0) {
      return res.status(404).json({
        message: "No trade history found",
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trade history fetched successfully",
      data: history
    });
  } catch (error) {
    console.error("Error fetching trade history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAllStakeInvestmentHistory = async (req, res) => {


  try {
    const userId = req.admin._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false
      });
    }

    const history = await AiAgentInvestment.find({}).sort({ createdAt: -1 }).populate("userId", "username name");

    if (!history || history.length === 0) {
      return res.status(404).json({
        message: "No stake investment history found",
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stake investment history fetched successfully",
      data: history
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error fetching stake investment history",
      success: false
    });

  }
}



