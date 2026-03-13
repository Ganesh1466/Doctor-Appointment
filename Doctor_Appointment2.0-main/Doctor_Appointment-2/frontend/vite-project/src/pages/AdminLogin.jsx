import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (loading) return;

        try {
            setLoading(true);

            // Clear any stale Supabase tokens that cause refresh token errors
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('sb-')) localStorage.removeItem(key);
            });

            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

            const res = await fetch(`${backendUrl}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const backendData = await res.json();

            if (!backendData.success) {
                toast.error(backendData.message || "Invalid Email or Password");
                return;
            }

            // Store ONLY in sessionStorage (AdminRoute checks sessionStorage.adminToken)
            // authAdmin middleware reads 'atoken' header — fetch calls must send it
            sessionStorage.setItem('adminToken', backendData.token);
            sessionStorage.setItem('aToken', backendData.token);

            toast.success("Admin Login Successful");
            navigate('/admin-dashboard');

        } catch (err) {
            console.error("Admin login error:", err);
            toast.error(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="w-full h-screen flex items-center justify-center bg-blue-50">
                <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg text-center">
                    <h2 className="text-2xl font-semibold text-blue-900">Admin Panel Login</h2>
                    <p className="text-sm text-blue-600 mt-1 mb-5">
                        Sign in to access the dashboard
                    </p>

                    <form onSubmit={onSubmitHandler}>
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-3 text-sm"
                            required
                            disabled={loading}
                        />

                        <div className="relative w-full mb-4">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none text-sm pr-12"
                                required
                                disabled={loading}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm mb-4 transition"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-4 text-sm text-blue-700">
                        <p>Are you a Doctor?</p>
                        <button
                            onClick={() => navigate('/doctor-login')}
                            className="text-blue-600 font-semibold hover:underline mt-1"
                        >
                            Doctor Login Here
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;