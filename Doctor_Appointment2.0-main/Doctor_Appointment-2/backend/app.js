import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Import Auth Routes

const app = express();
app.use(morgan('dev'));

// connectDB(); // MongoDB disabled per requirements
connectCloudinary();


// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://doctor-appointment-nine-phi.vercel.app", // Explicitly allow new domain
  process.env.FRONTEND_URL_LOCAL || "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / server-to-server
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "atoken", "token"],
  credentials: true
}));

app.options(/(.*)/, cors());

app.use(express.json());

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Routes
app.use("/api/auth", authRoutes); // Auth Routes
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/appointments", appointmentRouter);

app.get('/api/test-400', (req, res) => {
  res.status(400).json({ message: 'Test 400 Error' });
});

app.get('/', (req, res) => {
  res.send('Doctor Appointment Backend is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
