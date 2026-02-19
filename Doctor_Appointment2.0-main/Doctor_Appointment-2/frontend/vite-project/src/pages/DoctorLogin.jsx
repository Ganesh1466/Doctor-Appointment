import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabase';

const DoctorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleDoctorLogin = async () => {
        try {
            if (!email || !password) {
                toast.error("All fields are required");
                return;
            }

            // Check doctor credentials in Supabase table
            const { data: doctorData, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('email', email)
                .eq('password', password);

            if (error) {
                toast.error(error.message);
                return;
            }

            if (doctorData && doctorData.length > 0) {
                // Success: Store doctor session and redirect
                sessionStorage.setItem('doctorData', JSON.stringify(doctorData[0]));
                toast.success("Doctor Login Successful");
                navigate('/doctor-dashboard');
            } else {
                toast.error("Invalid Email or Password");
            }

        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-blue-50">
            <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg text-center">
                <h2 className="text-2xl font-semibold text-blue-900">Doctor Login</h2>
                <p className="text-sm text-blue-600 mt-1 mb-5">
                    Please login to manage your appointments
                </p>

                <input
                    type="email"
                    placeholder="Doctor Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-3 text-sm"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-4 text-sm"
                />

                <button
                    onClick={handleDoctorLogin}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm mb-4"
                >
                    Login
                </button>

                <div className="mt-4 text-sm text-blue-700">
                    <p>Are you an Admin?</p>
                    <button
                        onClick={() => navigate('/admin-login')}
                        className="text-blue-600 font-semibold hover:underline mt-1"
                    >
                        Admin Login Here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorLogin;
