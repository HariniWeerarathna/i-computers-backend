import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    email: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    userImage: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    isPublished: { type: Boolean, default: false },
    isAdminHidden: { type: Boolean, default: false },
    status: { type: String, enum: ["Pending", "Published", "Hidden"], default: "Pending" },
    date: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
