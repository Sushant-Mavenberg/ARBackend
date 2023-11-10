import express from "express";
import { fetchAllProducts, uploadProduct } from "../controllers/productController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(checkUserAuth);

// Customer Routes
router.get("/fetchall",fetchAllProducts);

// Seller/Admin Routes
router.post("/upload",uploadProduct);

export default router;