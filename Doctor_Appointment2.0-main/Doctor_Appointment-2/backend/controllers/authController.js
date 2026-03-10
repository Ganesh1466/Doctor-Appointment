
import supabase from '../config/supabase.js';
import supabaseAdmin from '../config/supabaseAdmin.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res, next) => {
    const { email, password, name } = req.body;

    try {
        console.log("Signup attempt for:", email);
        const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
                emailRedirectTo: `${frontendUrl}/login`
            }
        });

        if (error) {
            console.error("Supabase Signup Error (Exact Object):", JSON.stringify(error, null, 2));
            console.error("Supabase Signup Error Message:", error.message);

            // Handle the specific Supabase rate limit error when Confirm Email is ON
            if (error.message.includes('Error sending confirmation email') || error.code === 'unexpected_failure') {
                return res.status(429).json({
                    success: false,
                    message: "Registration limit exceeded. Please login with Google or sign in with Google."
                });
            }

            return res.status(error.status || 400).json({ success: false, message: error.message });
        }

        // Supabase returns a 200/201 without an error but with an empty user/identities array 
        // if the exact email is ALREADY registered when Confirm Email is securely turned ON.
        if (!data.user || (data.user && data.user.identities && data.user.identities.length === 0)) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered. Please log in instead."
            });
        }

        console.log("Signup successful in Supabase for:", email);

        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now log in.',
            user: data.user
        });

    } catch (error) {
        console.error("Signup Catch Error:", error);
        console.log("Detailed Error:", JSON.stringify(error, null, 2));
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Login Error for", email, ":", error.message);
            return res.status(error.status || 401).json({ message: error.message });
        }

        if (!data.user.email_confirmed_at) {
            console.warn("Login attempt for unverified email:", email);
            // Allow login even if not confirmed for easier development, 
            // but still notify the user in the response message if we want.
            // return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        res.json({
            message: 'Login successful',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        console.error("Login Catch Error:", error);
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

export { registerUser, loginUser, getMe };
