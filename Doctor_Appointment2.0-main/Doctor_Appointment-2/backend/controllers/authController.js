
import supabase from '../config/supabase.js';
import supabaseAdmin from '../config/supabaseAdmin.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: 'http://localhost:5173/login',
                data: { name }
            }
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        // Sync user to public 'users' table
        if (data.user) {
            const { error: profileError } = await supabaseAdmin
                .from('users')
                .insert([{
                    id: data.user.id,
                    name: name,
                    email: email,
                    image: '',
                    address: { line1: '', line2: '' },
                    gender: 'Not Selected',
                    phone: ''
                }]);

            if (profileError) {
                console.error("Error creating user profile:", profileError);
                // Note: We don't block response here, but ideally this should be atomic.
            }
        }

        res.status(201).json({
            message: 'Registration successful! Please check your email for verification.',
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ message: error.message });
        }

        if (!data.user.email_confirmed_at) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        res.json({
            message: 'Login successful',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = req.user;
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { registerUser, loginUser, getMe };
