import express from "express";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
import { createRazorpayOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use(checkUserAuth);

// Protected Routes
router.post("/create-razorpay-order",createRazorpayOrder);
router.post("/verify",verifyPayment);

export default router;