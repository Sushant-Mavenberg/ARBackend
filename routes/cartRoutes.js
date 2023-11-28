import express from "express";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
import { createCart, getCartByUserId } from "../controllers/cartController.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use(checkUserAuth);

// Protected Routes
router.get("/fetch",getCartByUserId);
router.post("/create",createCart);

export default router;