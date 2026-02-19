import express from "express";
import { bookAppointment, getDoctorAppointments, updateStatus } from "../controllers/appointmentController.js";

const appointmentRouter = express.Router();

appointmentRouter.post("/book", bookAppointment);
appointmentRouter.post("/doctor-list", getDoctorAppointments); // In real app, protect this
appointmentRouter.post("/update-status", updateStatus);

export default appointmentRouter;
