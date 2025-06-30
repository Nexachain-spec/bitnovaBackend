import mongoose from "mongoose";
const requiredUserSchema = mongoose.Schema({
    userCount: {
        type: Number,
        default: 0
    },
    percent: {
        type: Number,
        default: 0
    }
})

const FiveMemberModel = mongoose.model("FiveMemberModel", requiredUserSchema)
export default FiveMemberModel;