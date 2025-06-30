import mongoose from "mongoose";

const aiinvestmentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AIAgentPlan",
        required: true
    },
    investedAmount: {
        type: Number,
        required: true
    },
    investedAt: {
        type: Date,
        default: Date.now
    },
    maturityDate: {
        type: Date,
        required: true
    },
    expectedReturn: {
        type: Number,
        required: true
    },
    isMatured: {
        type: Boolean,
        default: false
    },
    isRedeemed: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const AiAgentInvestment = mongoose.model("AiAgentInvestment", aiinvestmentSchema);
export default AiAgentInvestment;

