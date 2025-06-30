import mongoose from "mongoose";

const announmentSchema = mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const AnnoucementModel = mongoose.model("AnnoucementModel", announmentSchema);
export default AnnoucementModel;
