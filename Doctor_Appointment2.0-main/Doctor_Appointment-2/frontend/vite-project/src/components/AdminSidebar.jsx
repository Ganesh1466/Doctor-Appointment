import React, { useState } from 'react';
import { assets } from '../assets/assets';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);


    const handleLogout = async () => {
        sessionStorage.removeItem('adminToken');
        navigate('/admin-login');
        toast.success("Logged out successfully");
    };

    return (
        <>
            {/* Mobile Menu Button - Fixed Floating */}
            <div className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg cursor-pointer">
                <img
                    onClick={() => setIsOpen(true)}
                    className="w-6 h-6"
                    src={assets.menu_icon}
                    alt="Menu"
                />
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
                w-64 bg-white shadow-md flex flex-col justify-between h-full border-r
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:flex
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div>
                    <div className="p-6 flex items-center justify-between">
                        <h1 className="text-2xl font-extrabold text-blue-600 cursor-pointer tracking-wider" onClick={() => { navigate('/admin-dashboard'); setIsOpen(false); }}>ADMIN PANEL</h1>
                        {/* Close button for mobile */}
                        <div className="md:hidden cursor-pointer text-gray-500 font-bold text-xl" onClick={() => setIsOpen(false)}>
                            ✕
                        </div>
                    </div>
                    <nav className="mt-6">
                        <div
                            onClick={() => { navigate('/admin-dashboard'); setIsOpen(false); }}
                            className="block px-6 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors border-r-4 border-transparent hover:border-blue-600"
                        >
                            Dashboard
                        </div>
                        <div
                            onClick={() => { navigate('/all-appointments'); setIsOpen(false); }}
                            className="block px-6 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors border-r-4 border-transparent hover:border-blue-600"
                        >
                            Appointments
                        </div>
                        <div
                            onClick={() => { navigate('/all-doctors'); setIsOpen(false); }}
                            className="block px-6 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors border-r-4 border-transparent hover:border-blue-600"
                        >
                            Doctors
                        </div>
                        <div
                            onClick={() => { navigate('/all-users'); setIsOpen(false); }}
                            className="block px-6 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors border-r-4 border-transparent hover:border-blue-600"
                        >
                            Users
                        </div>
                    </nav>
                </div>



                <div className="p-6 border-t">
                    <button
                        onClick={() => { handleLogout(); setIsOpen(false); }}
                        className="w-full flex items-center justify-center bg-red-600 text-white font-semibold py-1 px-2 rounded-md shadow-md hover:bg-red-700 transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div >
        </>
    );
};

export default AdminSidebar;
