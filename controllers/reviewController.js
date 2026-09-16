import Review from "../models/review.js";
import User from "../models/user.js";
import { isAdmin } from "./userController.js";

export async function createReview(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please log in to submit a review" });
    }

    const rating = Number(req.body.rating);
    const message = req.body.message?.trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !message) {
        return res.status(400).json({ message: "Please provide a rating and review message" });
    }

    try {
        const review = new Review({
            email: req.user.email,
            name: `${req.user.firstName} ${req.user.lastName}`.trim(),
            userImage: req.user.image || "",
            rating,
            message,
        });

        await review.save();
        return res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllReviews(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "You are not authorized to view reviews" });
    }

    try {
        const adminVisibleFilter = { isAdminHidden: { $ne: true } };
        const totalCount = await Review.countDocuments(adminVisibleFilter);
        const reviews = await Review.find(adminVisibleFilter).sort({ date: -1 });
        return res.json({ reviews, totalCount });
    } catch (error) {
        console.error("Error getting reviews:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getPublicReviews(req, res) {
    try {
        const reviews = await Review.find({ isPublished: true }).sort({ date: -1 }).select("name email userImage rating message date").lean();
        const emails = reviews.map((review) => review.email).filter(Boolean);
        const users = await User.find({ email: { $in: emails } }).select("email image").lean();
        const imagesByEmail = new Map(users.map((user) => [user.email, user.image]));
        const publicReviews = reviews.map(({ email, userImage, ...review }) => ({
            ...review,
            userImage: userImage || imagesByEmail.get(email) || "",
        }));

        return res.json(publicReviews);
    } catch (error) {
        console.error("Error getting public reviews:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateReviewVisibility(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "You are not authorized to manage reviews" });
    }

    if (typeof req.body.isPublished !== "boolean") {
        return res.status(400).json({ message: "A review status is required" });
    }

    try {
        const review = await Review.findById(req.params.reviewId);

        if (review == null) {
            return res.status(404).json({ message: "Review not found" });
        }

        review.isPublished = req.body.isPublished;
        review.status = req.body.isPublished ? "Published" : "Hidden";
        await review.save();

        return res.json({ message: "Review status updated", review });
    } catch (error) {
        console.error("Error updating review visibility:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteReview(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "You are not authorized to delete reviews" });
    }

    try {
        const review = await Review.findById(req.params.reviewId);

        if (review == null) {
            return res.status(404).json({ message: "Review not found" });
        }

        await Review.findByIdAndDelete(review._id);

        return res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function hideReviewFromAdmin(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "You are not authorized to manage reviews" });
    }

    try {
        const review = await Review.findByIdAndUpdate(
            req.params.reviewId,
            { isAdminHidden: true },
            { returnDocument: "after" },
        );

        if (review == null) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.json({ message: "Review removed from the admin list", review });
    } catch (error) {
        console.error("Error hiding review from admin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
