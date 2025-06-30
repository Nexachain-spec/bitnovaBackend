import mongoose from "mongoose";

const bonusTradeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bonusAmount: {
            type: Number,
            required: true,
        },
        tradeDetails: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
    },
    { timestamps: true }
);
const BonusTrade = mongoose.model("BonusTrade", bonusTradeSchema);
export default BonusTrade;