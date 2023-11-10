import express from "express";
import {userRegistration, userLoginViaPassword,changeUserPassword,sendUserPasswordResetEmail,userPasswordReset} from "../controllers/userController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use("/changepassword",checkUserAuth);

// Public Routes
router.post("/register",userRegistration);
router.post("/login",userLoginViaPassword);
router.post("/send-reset-password-email",sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token",userPasswordReset);

// Protected Routes
router.post("/changepassword",changeUserPassword);

export default router;