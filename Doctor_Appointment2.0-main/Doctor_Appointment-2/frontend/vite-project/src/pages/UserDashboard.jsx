import React from 'react';
import { NavLink } from 'react-router-dom';

const UserDashboard = () => {
    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">User Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* My Profile Card */}
                <NavLink
                    to="/my-profile"
                    className="group p-6 border rounded-xl hover:shadow-xl transition-all duration-300 border-blue-100 bg-blue-50 hover:bg-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 group-hover:text-blue-600">My Profile</h2>
                        <span className="text-3xl">👤</span>
                    </div>
                    <p className="text-gray-500 text-sm">View and edit your personal information and preferences.</p>
                </NavLink>

                {/* My Appointments Card */}
                <NavLink
                    to="/my-appointments"
                    className="group p-6 border rounded-xl hover:shadow-xl transition-all duration-300 border-green-100 bg-green-50 hover:bg-white"
                >
                    {/* Note: In App.jsx the route is /appointment/:docId for MyAppointment but logical route usually is /my-appointments. 
               The user asked to run routes, I need to check App.jsx again. 
               App.jsx has: <Route path='/appointment/:docId' element={<MyAppointment />} />
               Wait, that looks like a bug in App.jsx (same path as Appointment).
               I will assume I should fix the route for MyAppointment to be distinct, e.g., /my-appointments
           */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 group-hover:text-green-600">My Appointments</h2>
                        <span className="text-3xl">📅</span>
                    </div>
                    <p className="text-gray-500 text-sm">Check your upcoming and past appointments history.</p>
                </NavLink>
            </div>
        </div>
    );
};

export default UserDashboard;
