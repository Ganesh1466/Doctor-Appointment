import jwt from "jsonwebtoken";

// Admin Authentication Middleware
const authAdmin = async (req, res, next) => {
    try {

        const { atoken } = req.headers;

        if (!atoken) {
            return res.json({
                success: false,
                message: "Not Authorized, Login Again"
            });
        }

        // Verify Token
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

        // Check Admin Role
        if (!decoded || decoded.role !== "admin") {
            return res.json({
                success: false,
                message: "Not Authorized"
            });
        }

        // Allow access
        next();

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

export default authAdmin;