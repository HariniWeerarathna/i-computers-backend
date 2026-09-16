import mongoose from "mongoose";

const siteContentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    introduction: { type: String, required: true },
    supportingText: { type: String, required: true },
    buttonText: { type: String, required: true },
    values: {
        type: [{ title: String, text: String }],
        default: [],
    },
}, { timestamps: true });

export default mongoose.model("SiteContent", siteContentSchema);
