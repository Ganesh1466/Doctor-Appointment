import express from "express";
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, uploadImage } from "../controllers/userController.js";
import authUser from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/get-profile", authUser, getProfile);
router.post("/update-profile", upload.single('image'), authUser, updateProfile);
router.post("/upload-image", upload.single('image'), uploadImage);
router.post("/book-appointment", authUser, bookAppointment);
router.get("/appointments", authUser, listAppointment);
router.post("/cancel-appointment", authUser, cancelAppointment);

export default router;
