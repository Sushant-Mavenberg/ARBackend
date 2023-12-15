import express from "express";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
import { addToFavorite, fetchFavorites, removeFromFavorites } from "../controllers/favoriteController.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use(checkUserAuth);

// Protected Routes
router.get("/fetch",fetchFavorites);
router.post("/add",addToFavorite);
router.delete("/delete",removeFromFavorites);

export default router;