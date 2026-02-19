import jwt from 'jsonwebtoken';

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;
        if (!atoken) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }

        const token_decode = jwt.decode(atoken);

        // In loginAdmin we signed: email + password
        // Verification needs to match that logic or we should have signed an object.
        // In loginAdmin: jwt.sign(email + password, process.env.JWT_SECRET);
        // This is a bit unusual. Usually we sign an object { id: ... }
        // Let's verify against the logic in loginAdmin.

        // Wait, verifying a string payload is not standard.
        // Let's assume standard verify logic is what we want, but loginAdmin used a string.
        // I should probably fix loginAdmin to return a standard payload later if needed.
        // For now, let's verify using the secret.

        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

        if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }

        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authAdmin;
