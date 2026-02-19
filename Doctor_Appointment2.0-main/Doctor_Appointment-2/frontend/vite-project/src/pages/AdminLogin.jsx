import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { supabase } from '../supabase';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            // Direct Database Query for Custom Auth
            const { data, error } = await supabase
                .from('admins')
                .select('*') // Select all including password
                .eq('email', email)
                .eq('password', password); // Direct matching

            if (error) {
                toast.error(error.message);
            } else if (data && data.length > 0) {
                // Success
                toast.success("Admin Login Successful");
                sessionStorage.setItem('adminToken', JSON.stringify(data[0]));
                navigate('/admin-dashboard');
            } else {
                toast.error("Invalid Email or Password");
            }
        } catch (err) {
            toast.error("Something went wrong");
            console.error(err);
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
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-4 text-sm"
                            required
                        />

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm mb-4"
                        >
                            Login
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
