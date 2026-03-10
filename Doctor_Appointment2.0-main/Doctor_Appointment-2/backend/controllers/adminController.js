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
        const doctors = await doctorModel.find({}).select("-password");
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
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
        const { error: dbDeleteError } = await supabase
            .from('doctors')
            .delete()
            .eq('id', id);

        if (dbDeleteError) {
            console.error("Supabase delete doctor error:", dbDeleteError);
            return res.json({ success: false, message: dbDeleteError.message });
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

export { addDoctor, loginAdmin, allDoctors, deleteDoctor };
