import express from "express";
import { fetchAllProducts, fetchProduct, getImages, updateProduct, uploadProduct } from "../controllers/productController.js";
import { postReview, deleteReview, fetchUserRating, fetchProductReviews, verifyReview } from "../controllers/reviewController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Route level middleware - For protected routes

router.use("/fetch/:id/update",checkUserAuth);
router.use("/upload",checkUserAuth);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Customer Routes
router.get("/fetchall/:category?",fetchAllProducts);
router.get("/fetch/:id",fetchProduct);
router.get("/images/",getImages);
// Admin Routes
router.post("/upload",upload.fields([{ name: 'jpegImages', maxCount: 10 }, { name: 'glbImage', maxCount: 1 }, { name:'video', maxCount: 1 }]),uploadProduct);
router.put("/fetch/:id/update",upload.fields([{ name: 'jpegImages', maxCount: 10 }, { name: 'glbImage', maxCount: 1 },{ name:'video', maxCount: 1 }]),updateProduct);

export default router;