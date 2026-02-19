import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/AdminSidebar';

const AllAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                toast.error("Failed to fetch appointments");
                console.error(error);
            } else {
                setAppointments(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const cancelAppointment = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

        const { error } = await supabase
            .from('appointments')
            .update({ cancelled: true })
            .eq('id', id);

        if (error) {
            toast.error("Failed to cancel");
        } else {
            toast.success("Appointment Cancelled");
            fetchAppointments();
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-10 overflow-y-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Appointments History</h2>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">#</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Patient</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Doctor</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Date & Time</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Fees</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Action</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 border-b last:border-none">
                                        <td className="p-4 text-gray-600">{index + 1}</td>
                                        <td className="p-4 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {item.patient_name ? item.patient_name[0] : 'U'}
                                            </div>
                                            <p className="text-gray-800">{item.patient_name || 'Unknown'}</p>
                                        </td>
                                        <td className="p-4 text-gray-600">{item.doc_data?.name || 'Doctor'}</td>
                                        <td className="p-4 text-gray-600">
                                            {item.slot_date} <span className="text-xs text-gray-400 ml-1">| {item.slot_time}</span>
                                        </td>
                                        <td className="p-4 text-gray-600">${item.amount}</td>
                                        <td className="p-4">
                                            {item.cancelled ? (
                                                <span className="bg-red-100 text-red-600 py-1 px-3 rounded-full text-xs font-medium">Cancelled</span>
                                            ) : item.is_completed ? (
                                                <span className="bg-green-100 text-green-600 py-1 px-3 rounded-full text-xs font-medium">Accepted</span>
                                            ) : (
                                                <span className="bg-yellow-100 text-yellow-600 py-1 px-3 rounded-full text-xs font-medium">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {!item.cancelled && !item.is_completed && (
                                                <button
                                                    onClick={() => cancelAppointment(item.id)}
                                                    className="text-red-500 hover:text-red-700 text-xl font-bold"
                                                    title="Cancel Appointment (Database)"
                                                >
                                                    x
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setAppointments(prev => prev.filter(app => app.id !== item.id))}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                title="Hide from View (Local Only)"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {loading && <p className="p-4 text-center text-gray-500">Loading appointments...</p>}
                    {!loading && appointments.length === 0 && <p className="p-4 text-center text-gray-500">No appointments found.</p>}
                </div>
            </div>
        </div>
    );
};

export default AllAppointments;
