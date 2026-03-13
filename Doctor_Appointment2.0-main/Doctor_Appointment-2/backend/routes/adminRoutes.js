import express from "express";
import {
  addDoctor,
  loginAdmin,
  allDoctors,
  deleteDoctor,
  getLoginStats,
  getBookingStats,
  getDashboardData,
  getRegistrationStats
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/login-stats", getLoginStats);
adminRouter.get("/booking-stats", getBookingStats);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor);
adminRouter.get("/dashboard-data", authAdmin, getDashboardData);
adminRouter.get("/registration-stats", authAdmin, getRegistrationStats);

export default adminRouter;
