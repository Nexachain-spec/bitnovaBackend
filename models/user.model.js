import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      // required: true,
      unique: true,
    },
    mainWallet: {
      type: Number,
      default: 0,
    },
    principleAmount: {
      type: Number,
      default: 0
    },

    additionalWallet: {
      type: Number,
      default: 0,
    },
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
    username: {
      type: String,
    },
    name: {
      type: String,
      default: ""
    },

    parentReferedCode: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    aiCredits: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
    left: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
    right: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
    position: { type: String, default: null },
    referedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }],
    totalEarnings: { type: Number, default: 0 },
    currentEarnings: { type: Number, default: 0 },
    walletAddress: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"] },
    status: { type: Boolean, default: false },
    activeDate: { type: Date, default: null },
    totalPayouts: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 0,
    },
    BonusCredit: {
      type: Number,
      default: 0,
    },
    lastUpgradeAt: {
      type: Date,
      default: null,
    },
    stakeAmount: {
      type: Number,
      default: 0,
    },
    bonusAddedAt: {
      type: Date,
      default: null,
    },
    phone: {
      type: Number,
    },
    plainPassword: {
      type: String,
      default: ""
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpire: {
      type: Date,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    activeAMembers: { type: Number, default: 0 },
    activeBCMembers: { type: Number, default: 0 },
    timelineStart: { type: Date, default: null },
    timelineEnd: { type: Date, default: null },
    activatedAssetAmount: { type: Number, default: 0 },
    trailFund: { type: Number, default: 0 },

    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Investment" }],
    totalInvestment: {
      type: Number,
      default: 0,
    },
    dailyRoi: {
      type: Number,
      default: 0,
    },
    totalRoi: {
      type: Number,
      default: 0,
    },
    bonusTrade: {
      type: Number,
      default: 0,
    },
    totalBonusTrade: {
      type: Number,
      default: 0,
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
    },
    lastTradeDate: {
      type: Date,
      default: null,
    },
    todayTradeCount: {
      type: Number,
      default: 0,
    },
    rewards: {
      type: Number,
      default: 0,
    },
    totalSuccessfulTrades: {
      type: Number,
      default: 0,
    },
    totalFailedTrades: {
      type: Number,
      default: 0,
    },
    totalTradeCount: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
      default: null,
    },

    isLoginBlocked: {
      type: Boolean,
      default: false,
    },
    levelIncome: {
      type: Number,
      default: 0,
    },
    directReferalAmount: {
      type: Number,
      default: 0,
    },
    withdrawalCount: {
      type: Number,
      default: 0,
    },
    lastWithdrawalDate: {
      type: Date,
    },


    withdrawalBlockedUntil: {
      type: Date,
      default: null,
    },
    isIncomeBlocked: {
      type: Boolean,
      default: false,
    },
    aiAgentDaily: {
      type: Number,
      default: 0,
    },
    aiAgentTotal: {
      type: Number,
      default: 0,
    },
    isUpgraded: {
      type: Boolean,
      default: false,
    },
    twoFASecret: {
      type: String,
      default: ""
    },
    ipAddress: {
      type: String,
      default: ""
    },
    macAddress: {
      type: String,
      default: ""
    },
    // bep20Address: {
    //   type: String,
    //   // unique: true
    // },
    depositPrivateKey: {
      type: String,
      default: null
    },
    depositWalletAddress: {
      type: String,
      default: null
    },
    isWithdrawalblock: { type: Boolean, default: false },
    // trc20Address: {
    //   type: String,
    //   unique: true
    // }
  },

  { timestamps: true }
);


userSchema.index({ email: 1 }, { unique: true });

const UserModel = mongoose.model("UserModel", userSchema);
export default UserModel;
