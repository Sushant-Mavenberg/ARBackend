import express from "express";
import { fetchProductReviews, fetchUserRating, postReview, verifyReview } from "../controllers/reviewController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();


// Route level middleware - For protected routes
router.use("/post",checkUserAuth);
router.use("/verify",checkUserAuth);
router.use("/:productId/fetch-user-rating",checkUserAuth);

// Customer Routes
router.get("/:productId/fetch",fetchProductReviews);
router.get("/:productId/fetch-user-rating",fetchUserRating);
router.post("/post",postReview);

// Admin Routes
router.patch("/verify",verifyReview)

export default router;