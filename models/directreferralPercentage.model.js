import mongoose from "mongoose";
const directPercentageSchema = mongoose.Schema({
    newPercentage: {
        type: Number,
        default: 0
    },
    oldPercentage: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: null
    }
}, { timestamps: true })

const ReferralPercentageChangeModel = mongoose.model("ReferralPercentageChangeModel", directPercentageSchema)

export default ReferralPercentageChangeModel