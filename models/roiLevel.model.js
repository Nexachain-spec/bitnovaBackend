import mongoose from "mongoose";

const roiLevelSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    unique: true,
  },
  minInvestment: {
    type: Number,
    required: true,
  },
  maxInvestment: {
    type: Number,
    required: true,
  },
  roi: {
    type: Number,
    required: true,
  },
  teamA: {
    type: Number,
    required: true,
  },
  teamBAndC: {
    type: Number,
    required: true,
  },
});

const RoiLevel = mongoose.model("RoiLevel", roiLevelSchema);

export default RoiLevel;
