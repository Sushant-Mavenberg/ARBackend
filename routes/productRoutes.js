import express from "express";
import { fetchAllProducts, fetchProduct, uploadProduct } from "../controllers/productController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

router.use(checkUserAuth);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Customer Routes
router.get("/fetchall/:category?",fetchAllProducts);
router.get("/fetch/:id",fetchProduct);

// Seller/Admin Routes
router.post("/upload",upload.fields([{ name: 'jpegImages', maxCount: 10 }, { name: 'glbImage', maxCount: 1 }]),uploadProduct);

export default router;