import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
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
        let imageUrl = "";
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
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

// API to delete doctor permanently
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Doctor ID is required." });
        }

        const { data: docData, error: fetchError } = await supabase
            .from('doctors')
            .select('email')
            .eq('id', id)
            .single();

        if (fetchError || !docData) {
            return res.json({ success: false, message: "Doctor not found in database." });
        }

        const doctorEmail = docData.email;

        const { error: dbDeleteError } = await supabaseAdmin
            .from('doctors')
            .delete()
            .eq('id', id);

        if (dbDeleteError) {
            return res.json({ success: false, message: dbDeleteError.message });
        }

        // Find and delete from Auth
        try {
            const { data: { users }, error: listAuthError } = await supabaseAdmin.auth.admin.listUsers();
            if (!listAuthError && users) {
                const authUser = users.find(u => u.email === doctorEmail);
                if (authUser) {
                    await supabaseAdmin.auth.admin.deleteUser(authUser.id);
                }
            }
        } catch (authErr) {
            console.error("Auth delete error:", authErr);
        }

        res.json({ success: true, message: "Doctor deleted permanently" });

    } catch (error) {
        console.error("Delete Doctor Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Dashboard Stats Controllers
const getLoginStats = async (req, res) => {
    try {
        const perPage = 100;
        let page = 1;
        const allUsers = [];

        while (true) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
            if (error) throw error;

            const users = data?.users || [];
            if (!users.length) break;
            allUsers.push(...users);
            if (users.length < perPage) break;
            page += 1;
        }

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
            if (!dt || isNaN(dt.getTime())) return;
            const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
            if (monthMap[key] !== undefined) monthMap[key] += 1;
        });

        res.json(months.map((m) => ({ month: m.month, logins: monthMap[m.key] })));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingStats = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('appointments').select('date');
        if (error) return res.json([]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
            const dt = row.date ? (isNaN(row.date) ? new Date(row.date) : new Date(Number(row.date))) : null;
            if (!dt || isNaN(dt.getTime())) return;
            const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
            if (monthMap[key] !== undefined) monthMap[key] += 1;
        });

        res.json(months.map((m) => ({ month: m.month, bookings: monthMap[m.key] })));
    } catch (error) {
        res.json([]);
    }
};

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
            const dt = row.date ? (isNaN(row.date) ? new Date(row.date) : new Date(Number(row.date))) : null;
            if (!dt || isNaN(dt.getTime())) return;
            const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
            if (monthMap[key] !== undefined) monthMap[key] += 1;
        });

        res.json(months.map((m) => ({ month: m.month, registrations: monthMap[m.key] })));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDashboardData = async (req, res) => {
    try {
        const [docRes, appRes, userRes] = await Promise.all([
            supabaseAdmin.from('doctors').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true })
        ]);

        if (docRes.error) throw docRes.error;
        if (appRes.error) throw appRes.error;
        if (userRes.error) throw userRes.error;

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
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addDoctor, loginAdmin, allDoctors, deleteDoctor, getLoginStats, getBookingStats, getDashboardData, getRegistrationStats };
