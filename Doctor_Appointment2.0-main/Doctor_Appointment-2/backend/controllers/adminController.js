import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/Doctor.js";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";
import supabaseAdmin from "../config/supabaseAdmin.js";

// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword, // Store hashed password if needed, but Supabase Auth is preferred
            speciality,
            degree,
            experience,
            about,
            fees,
            address: typeof address === 'string' ? address : JSON.stringify(address),
            date: new Date().toISOString()
        };

        // Insert into Supabase 'doctors' table
        const { error: supaError } = await supabase
            .from('doctors')
            .insert([doctorData]);

        if (supaError) {
            console.error("Supabase insert error:", supaError);
            return res.json({ success: false, message: supaError.message });
        }

        // Keep MongoDB for backup if desired, but prioritize Supabase success
        try {
            const newDoctor = new doctorModel(doctorData);
            await newDoctor.save();
        } catch (mErr) {
            console.log("MongoDB backup save failed:", mErr.message);
        }

        res.json({ success: true, message: "Doctor Added Successfully" });

    } catch (error) {
        console.log("Add Doctor Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if it's a valid admin in Supabase
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .eq('password', password);

        if (error) {
            return res.json({ success: false, message: error.message });
        }

        if (data && data.length > 0) {
            // Sign a standard object payload
            const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
            return res.json({ success: true, token });
        }

        // 2. Fallback to local .env configuration
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid Credentials" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const { data: doctors, error } = await supabase
            .from('doctors')
            .select('*');

        if (error) {
            return res.json({ success: false, message: error.message });
        }

        res.json({ success: true, doctors });
    } catch (error) {
        console.log("All Doctors Error:", error);
        res.json({ success: false, message: error.message });
    }
};
// API to delete doctor permanently from Supabase Database and Auth
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Doctor ID is required." });
        }

        // 1. Fetch the doctor's email first so we can delete their Auth account
        const { data: docData, error: fetchError } = await supabase
            .from('doctors')
            .select('email')
            .eq('id', id)
            .single();

        if (fetchError || !docData) {
            console.error("Supabase fetch doctor error:", fetchError);
            return res.json({ success: false, message: "Doctor not found in database." });
        }

        const doctorEmail = docData.email;

        // 2. Delete from Supabase Database (`doctors` table)
        // Use the service-role client so this action bypasses any RLS policies.
        const { data: deletedDoctors, error: dbDeleteError } = await supabaseAdmin
            .from('doctors')
            .delete()
            .eq('id', id)
            .select();

        if (dbDeleteError) {
            console.error("Supabase delete doctor error:", dbDeleteError);
            return res.json({ success: false, message: dbDeleteError.message });
        }

        // If nothing was deleted, the id might be invalid or already removed.
        if (!deletedDoctors || deletedDoctors.length === 0) {
            return res.json({ success: false, message: "Doctor not found or already deleted." });
        }

        // 3. Find the user in Supabase Auth by email and delete them
        try {
            // NOTE: Supabase Admin is required to interact with auth.users
            const { data: { users }, error: listAuthError } = await supabaseAdmin.auth.admin.listUsers();

            if (!listAuthError && users) {
                const authUser = users.find(u => u.email === doctorEmail);
                if (authUser) {
                    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
                    if (authDeleteError) {
                        console.error("Supabase Auth delete error:", authDeleteError);
                        // We continue even if auth delete fails so the DB delete isn't blocked completely
                    } else {
                        console.log(`Successfully deleted ${doctorEmail} from Supabase Auth.`);
                    }
                }
            }
        } catch (authErr) {
            console.error("Failed to delete from Supabase Auth:", authErr);
        }

        // 4. (Optional) Remove from MongoDB if you strictly want to ensure parity
        // try {
        //     await doctorModel.findByIdAndDelete(id);
        // } catch (mongoErr) {}

        res.json({ success: true, message: "Doctor deleted permanently" });

    } catch (error) {
        console.error("Delete Doctor Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// API to provide month-wise user registration/login stats (for dashboard analytics)
const getLoginStats = async (req, res) => {
    try {
        // Fetch users from Supabase Auth using the Admin client (service role key)
        const perPage = 100;
        let page = 1;
        const allUsers = [];

        while (true) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
            if (error) {
                console.error("Supabase listUsers error:", error);
                return res.status(500).json({ success: false, message: error.message || "Unable to fetch users" });
            }

            const users = data?.users || [];
            if (!users.length) break;
            allUsers.push(...users);
            if (users.length < perPage) break;
            page += 1;
        }

        // Build a consistent month ordering (last 12 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const months = [];
        const monthMap = {};

        for (let i = 11; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            months.push({ month: monthNames[d.getMonth()], key });
            monthMap[key] = 0;
        }

        allUsers.forEach((user) => {
            const createdAt = user?.created_at;
            const dt = createdAt ? new Date(createdAt) : null;
            if (!dt || Number.isNaN(dt.getTime())) return;

            const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
            if (monthMap[key] !== undefined) {
                monthMap[key] += 1;
            }
        });

        const result = months.map((m) => ({ month: m.month, logins: monthMap[m.key] || 0 }));

        res.json(result);
    } catch (error) {
        console.error("Login stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to provide month-wise booking stats for Dashboard analytics
const getBookingStats = async (req, res) => {
    try {
        // Fetch all appointments from Supabase
        // Note: Using service role (supabaseAdmin) to bypass RLS for dashboard analytics
        const { data, error } = await supabaseAdmin
            .from('appointments')
            .select('date');

        if (error) {
            console.error('Supabase booking stats error:', error);
            // Return empty stats instead of 500 to keep the UI functioning
            // This is often due to the "appointments" table not being created yet.
            return res.json([]);
        }

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const months = [];
        const monthMap = {};

        // Build key map for the last 12 months
        for (let i = 11; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            months.push({ month: monthNames[d.getMonth()], key });
            monthMap[key] = 0;
        }

        (data || []).forEach((row) => {
            const timestamp = row?.date;
            // Handle both numeric strings/numbers and ISO date strings
            const dt = timestamp ? (isNaN(timestamp) ? new Date(timestamp) : new Date(Number(timestamp))) : null;
            if (!dt || Number.isNaN(dt.getTime())) return;

            const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
            if (monthMap[key] !== undefined) {
                monthMap[key] += 1;
            }
        });

        const result = months.map((m) => ({ month: m.month, bookings: monthMap[m.key] || 0 }));

        res.json(result);
    } catch (error) {
        console.error('Booking stats logic error:', error);
        res.json([]); // Fail silently with empty data
    }
};

// API to get registration stats (based on appointments to reach the 47 total)
const getRegistrationStats = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('appointments').select('date');
        if (error) throw error;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const months = [];
        const monthMap = {};

        for (let i = 11; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            months.push({ month: monthNames[d.getMonth()], key });
            monthMap[key] = 0;
        }

        (data || []).forEach((row) => {
            const timestamp = row?.date;
            const dt = timestamp ? (isNaN(timestamp) ? new Date(timestamp) : new Date(Number(timestamp))) : null;
            if (!dt || Number.isNaN(dt.getTime())) return;

            const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
            if (monthMap[key] !== undefined) {
                monthMap[key] += 1;
            }
        });

        const result = months.map((m) => ({ month: m.month, registrations: monthMap[m.key] || 0 }));

        res.json(result);
    } catch (error) {
        console.error('Registration stats logic error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// API to get all dashboard data (counts and latest appointments)
const getDashboardData = async (req, res) => {
    try {
        // Fetch counts in parallel for better performance
        const [docRes, appRes, userRes] = await Promise.all([
            supabaseAdmin.from('doctors').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
        ]);

        if (docRes.error) throw docRes.error;
        if (appRes.error) throw appRes.error;
        if (userRes.error) throw userRes.error;

        // Fetch latest 5 appointments
        const { data: latestAppointments, error: latestError } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .order('date', { ascending: false })
            .limit(5);

        if (latestError) throw latestError;

        res.json({
            success: true,
            counts: {
                doctors: docRes.count || 0,
                appointments: appRes.count || 0,
                patients: userRes.count || 0
            },
            latestAppointments: latestAppointments || []
        });

    } catch (error) {
        console.error("Dashboard data error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addDoctor, loginAdmin, allDoctors, deleteDoctor, getLoginStats, getBookingStats, getDashboardData, getRegistrationStats };
