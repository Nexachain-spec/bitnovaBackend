import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
    },
    invest: {
      type: Number,
      required: true,
    },
    aiCredits: {
      type: Number,
      required: true,
    },
    activeA: {
      type: Number,
      required: true,
    },
    activeBC: {
      type: Number,
      required: true,
    },
    timelineDays: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LevelRequirementSchema = mongoose.model(
  "LevelRequirementSchema",
  requirementSchema
);
export default LevelRequirementSchema;
