import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/Doctor.js";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";

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
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor Added" });

    } catch (error) {
        console.log(error);
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
            // Sign the standard expected payload so authAdmin passes
            const token = jwt.sign(process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD, process.env.JWT_SECRET);
            return res.json({ success: true, token });
        }

        // 2. Fallback to local .env configuration
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
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
        const doctors = await doctorModel.find({}).select("-password");
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
// API to delete doctor permanently from Supabase
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Doctor ID is required." });
        }

        // Delete from Supabase (bypasses RLS since backend uses service_role key)
        const { error: supaError } = await supabase
            .from('doctors')
            .delete()
            .eq('id', id);

        if (supaError) {
            console.error("Supabase delete doctor error:", supaError);
            return res.json({ success: false, message: supaError.message });
        }

        // Keep MongoDB deletion in sync just in case the app switches back
        try {
            await doctorModel.findByIdAndDelete(id);
        } catch (mongoErr) {
            console.log("MongoDB delete skip (expected if using purely Supabase)", mongoErr.message);
        }

        res.json({ success: true, message: "Doctor deleted permanently" });

    } catch (error) {
        console.error("Delete Doctor Error:", error);
        res.json({ success: false, message: error.message });
    }
};

export { addDoctor, loginAdmin, allDoctors, deleteDoctor };
