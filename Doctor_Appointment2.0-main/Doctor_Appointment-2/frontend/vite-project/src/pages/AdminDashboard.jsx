import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

import BookingAnalyticsChart from '../components/BookingAnalyticsChart';
import UserRegistrationChart from '../components/UserRegistrationChart';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({
        doctors: 0,
        appointments: 0,
        patients: 0
    });
    const [latestAppointments, setLatestAppointments] = useState([]);


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = sessionStorage.getItem('aToken');
                if (!token) return;

                const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
                const response = await axios.get(`${baseUrl.replace(/\/+$/, '')}/api/admin/dashboard-data`, {
                    headers: { aToken: token }
                });

                if (response.data.success) {
                    setCounts(response.data.counts);
                    setLatestAppointments(response.data.latestAppointments);
                } else {
                    console.error("Failed to fetch dashboard data:", response.data.message);
                }

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-y-auto">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>

                <div className="mb-10 max-w-5xl">
                    <UserRegistrationChart />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Stat Card 1 - Doctors */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center gap-4 cursor-pointer" onClick={() => navigate('/all-doctors')}>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <img src={assets.doctor_icon || assets.appointment_img} alt="" className="w-8 h-8 opacity-70" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800">{counts.doctors}</p>
                            <h3 className="text-gray-500 text-sm font-medium">Total Doctors</h3>
                        </div>
                    </div>

                    {/* Stat Card 2 - Appointments */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center gap-4 cursor-pointer" onClick={() => navigate('/all-appointments')}>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <img src={assets.appointment_img} alt="" className="w-8 h-8 opacity-70" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800">{counts.appointments}</p>
                            <h3 className="text-gray-500 text-sm font-medium">Total Appointments</h3>
                        </div>
                    </div>

                    {/* Stat Card 3 - Patients */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center gap-4 cursor-pointer" onClick={() => navigate('/all-users')}>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <img src={assets.profile_pic} alt="" className="w-8 h-8 rounded-full object-cover opacity-80" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800">{counts.patients}</p>
                            <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                        </div>
                    </div>
                </div>

                {/* Latest Activity Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-gray-800">Latest Appointments</h3>
                        <p className="text-blue-600 text-sm cursor-pointer hover:underline" onClick={() => navigate('/all-appointments')}>View All</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 border-b font-medium text-gray-600 text-sm">#</th>
                                    <th className="p-4 border-b font-medium text-gray-600 text-sm">Patient</th>
                                    <th className="p-4 border-b font-medium text-gray-600 text-sm">Doctor</th>
                                    <th className="p-4 border-b font-medium text-gray-600 text-sm">Date</th>
                                    <th className="p-4 border-b font-medium text-gray-600 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestAppointments.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 border-b last:border-none cursor-pointer">
                                        <td className="p-4 text-gray-500 text-sm">{index + 1}</td>
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {item.patient_name ? item.patient_name[0] : 'U'}
                                            </div>
                                            <p className="text-gray-800 text-sm font-medium">{item.patient_name || 'Unknown'}</p>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            {item.doc_data?.name || 'Doctor'}
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            {item.slot_date}
                                        </td>
                                        <td className="p-4">
                                            {item.cancelled ? (
                                                <span className="bg-red-50 text-red-600 py-1 px-3 rounded-full text-xs font-medium">Cancelled</span>
                                            ) : item.is_completed ? (
                                                <span className="bg-green-50 text-green-600 py-1 px-3 rounded-full text-xs font-medium">Completed</span>
                                            ) : (
                                                <span className="bg-yellow-50 text-yellow-600 py-1 px-3 rounded-full text-xs font-medium">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {latestAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-6 text-center text-gray-500 text-sm">No recent appointments</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};


export default AdminDashboard;
