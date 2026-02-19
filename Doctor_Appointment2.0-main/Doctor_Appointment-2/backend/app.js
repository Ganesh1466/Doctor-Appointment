import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Import Auth Routes
import rateLimit from 'express-rate-limit'; // Import Rate Limit

const app = express();

// connectDB(); // MongoDB disabled per requirements
connectCloudinary();

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter); // Apply rate limiting

// Middleware
app.use(cors());
app.use(express.json());

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Routes
app.use("/api/auth", authRoutes); // Auth Routes
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/appointments", appointmentRouter);

app.get('/', (req, res) => {
    res.send('Doctor Appointment Backend is running');
});

export default app;
