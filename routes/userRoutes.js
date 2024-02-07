import express from "express";
import {userRegistration, userLoginViaPassword,changeUserPassword,sendUserPasswordResetEmail,userPasswordReset, sendOtp, userLoginViaOtp, userLogout, updateUserProfile, fetchAddresses, addAddress, updateAddress, deleteAddress, getUser} from "../controllers/userController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route level middleware - For protected routes
router.use("/changepassword",checkUserAuth);
router.use("/get-user",checkUserAuth);
router.use("/logout",checkUserAuth);
router.use("/update-profile",checkUserAuth);
router.use("/addresses",checkUserAuth);
router.use("/add-address",checkUserAuth);
router.use("/addresses/:id/update",checkUserAuth);
router.use("/addresses/:id/delete",checkUserAuth);

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
router.put("/update-profile",upload.single("profilePicture"),updateUserProfile);
router.get("/get-user",getUser);

// Address Routes
router.get("/addresses",fetchAddresses);
router.post("/add-address",addAddress);
router.post("/addresses/:id/update",updateAddress);
router.delete("/addresses/:id/delete",deleteAddress);
export default router;

