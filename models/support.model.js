import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  response: {
    type: String,
    default: ""
  }
});

const supportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Closed"],
    default: "Pending",
  },
  response: {
    type: String,
  },
  file: {
    type: String,
    default: "",
  },
  messages: [messageSchema], // 🆕 Embedded chat messages
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Support = mongoose.model("Support", supportSchema);

export default Support;
