import express from "express";
import { createOrder, updateOrderStatus } from "../controllers/orderController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use(checkUserAuth);


router.post("/create-order",createOrder)

// Admin routes
router.patch("/:id/update-status",updateOrderStatus);

export default router;