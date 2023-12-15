import express from "express";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
import { addToCart, deleteCart, getCartByUserId, updateCart } from "../controllers/cartController.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use(checkUserAuth);

// Protected Routes
router.get("/fetch",getCartByUserId);
router.post("/add",addToCart);
router.put("/update/:cartId",updateCart);
router.delete("/delete/:cartId",deleteCart);

export default router;