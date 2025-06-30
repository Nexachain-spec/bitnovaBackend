import mongoose from "mongoose";

const agentPlanSchema = new mongoose.Schema({
    agentName: {
        type: String,
        required: true,
    },
    durationInDays: {
        type: Number,
        required: true,
    },
    incomePercent: {
        type: Number,
        required: true,
    },
    minInvestment: {
        type: Number,
        required: true,
    },
    maxInvestment: {
        type: Number,
        required: true,
    },
    aiAgentFee: {
        type: String,
        default: "",
    },
    computingSkills: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const AIAgentPlan = mongoose.model("AIAgentPlan", agentPlanSchema);
export default AIAgentPlan;
