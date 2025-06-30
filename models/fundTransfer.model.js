import mongoose, { Mongoose } from "mongoose";

const fundTransferSchema = mongoose.Schema({
    amount: {
        type: Number,
        default: 0
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    }

}, { timestamps: true })

const FundTransfer = mongoose.model("FundTransfer", fundTransferSchema)

export default FundTransfer;