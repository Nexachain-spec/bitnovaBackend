import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserModel",
            required: true,
        },
        userWalletAddress: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        netAmountSent: {
            type: Number,
            required: true,
        },
        feeAmount: {
            type: Number,
            required: true,
        },
        transactionHash: {
            type: String,
        },
        status: {
            type: String,
            enum: ["success", "failed"],
            required: true,
        },
        error: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;