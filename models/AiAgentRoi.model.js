import mongoose from "mongoose";

const aiAgentHistorySchema = new mongoose.Schema({
    investmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AiAgentInvestment",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
    },
    actionType: {
        type: String,
        enum: ["ROI_CREDITED", "INVESTMENT_MATURED"],
        required: true,
    },
    amount: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const AiAgentHistory = mongoose.model("AiAgentHistory", aiAgentHistorySchema);
export default AiAgentHistory;