import express from "express";
import { signupDoctor, loginDoctor, appointmentsDoctor, appointmentCancel, appointmentComplete, doctorDashboard, doctorList } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const router = express.Router();

router.get("/list", doctorList);
router.post("/signup", signupDoctor);
router.post("/login", loginDoctor);
router.get("/appointments", authDoctor, appointmentsDoctor);
router.post("/complete-appointment", authDoctor, appointmentComplete);
router.post("/cancel-appointment", authDoctor, appointmentCancel);
router.get("/dashboard", authDoctor, doctorDashboard);

export default router;
