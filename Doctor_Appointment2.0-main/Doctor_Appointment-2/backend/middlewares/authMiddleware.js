import supabase from '../config/supabase.js';

const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized. Please login again."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify the token using Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.log("Auth Middleware Error:", error?.message || "User not found");
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // Attach user info to request
        req.user = user;

        next();

    } catch (error) {
        console.log("Auth Middleware Catch Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
}

export default authUser;
