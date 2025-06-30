import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    withdrawalLimit: {
        type: Number,
        default: 3,
    },
});

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;