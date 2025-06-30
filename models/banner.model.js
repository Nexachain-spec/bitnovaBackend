import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
  },
  desription: {
    type: String,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
