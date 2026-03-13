import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";

const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;

        if (!atoken) {
            return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
        }

        // Verify token
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not Authorized" });
        }

        // Check if this exact email exists in Supabase admins table
        const { data, error } = await supabase
            .from("admins")
            .select("email")
            .eq("email", decoded.email)
            .maybeSingle();

        if (error || !data) {
            return res.status(403).json({ success: false, message: "Not Authorized, Login Again" });
        }

        // Email exists in DB — allow through
        next();

    } catch (error) {
        console.error("Auth Admin Error:", error.message);
        return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }
};

export default authAdmin;