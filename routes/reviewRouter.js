import express from "express";
import { createReview, deleteReview, getAllReviews, getPublicReviews, hideReviewFromAdmin, updateReviewVisibility } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/public", getPublicReviews);
reviewRouter.get("/", getAllReviews);
reviewRouter.put("/:reviewId/visibility", updateReviewVisibility);
reviewRouter.put("/:reviewId/admin-visibility", hideReviewFromAdmin);
reviewRouter.delete("/:reviewId", deleteReview);

export default reviewRouter;
