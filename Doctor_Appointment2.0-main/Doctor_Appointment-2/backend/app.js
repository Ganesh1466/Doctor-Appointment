import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';
import connectCloudinary from './config/cloudinary.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Import Auth Routes
import supabase from './config/supabase.js';

const app = express();
app.use(morgan('dev'));

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

app.get('/api/debug-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (error) {
      return res.status(500).json({ success: false, error: error.message, details: error });
    }

    const columns = data.length > 0 ? Object.keys(data[0]) : "No rows found to determine columns";
    
    // Test the specific query that is failing in the frontend
    const docId = '103cca86-0e9a-4945-88bc-fc8c610c75bb';
    const { error: queryError } = await supabase
      .from('appointments')
      .select('slot_date, slot_time')
      .eq('doc_id', docId)
      .neq('status', 'Cancelled');

    res.json({ 
      success: true, 
      columns, 
      sampleData: data[0],
      testQueryError: queryError ? queryError.message : "None",
      testQueryDetails: queryError
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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
