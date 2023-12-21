import express from "express";
import { createRazorpayOrder } from "../controllers/orderController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use("/create-razorpay-order",checkUserAuth);

// Protected Routes
router.post("/create-razorpay-order",createRazorpayOrder);

export default router;