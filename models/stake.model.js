import mongoose from "mongoose";

const stakeSchema = mongoose.Schema({
    amount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: null
    },
    txHash: {
        type: String,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    }
}, { timestamps: true })

const StakeModel = mongoose.model("StakeModel", stakeSchema)

export default StakeModel