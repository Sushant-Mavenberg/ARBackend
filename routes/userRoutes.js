import express from "express";
import {userRegistration, userLoginViaPassword,changeUserPassword,sendUserPasswordResetEmail,userPasswordReset, sendOtp, userLoginViaOtp, userLogout} from "../controllers/userController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route level middleware - For protected routes
router.use("/changepassword",checkUserAuth);
router.use("/logout",checkUserAuth);

// Public Routes
router.post("/register",userRegistration);
router.post("/login-via-password",userLoginViaPassword);
router.post("/send-otp",sendOtp);
router.post("/login-via-otp",userLoginViaOtp);
router.post("/send-reset-password-email",sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token",userPasswordReset);

// Protected Routes
router.post("/changepassword",changeUserPassword);
router.post("/logout",userLogout);

export default router;