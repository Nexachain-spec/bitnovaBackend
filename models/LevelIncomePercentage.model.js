import mongoose from "mongoose";

const LevelPercentageSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
    },
    A: {
      type: Number,
      required: true,
      default: 0,
    },
    B: {
      type: Number,
      required: true,
      default: 0,
    },
    C: {
      type: Number,
      required: true,
      default: 0,
    },
    D: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const LevelPercentage = mongoose.model(
  "LevelPercentage",
  LevelPercentageSchema
);

export default LevelPercentage;
