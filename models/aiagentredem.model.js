import mongoose from "mongoose";

const AiAgentRedeemSchema = new mongoose.Schema({
    amount: {
        type: Number,
        default: 0
    },
    message: {
        type: String,
        default: ""

    }
}, { timestamps: true })

const AiAgentRedeem = mongoose.model("AiAgentRedeem")