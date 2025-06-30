import mongoose from "mongoose";

const adminTopUpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    },
    amount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const AdminTopUp = mongoose.model("AdminTopUp", adminTopUpSchema)
export default AdminTopUp